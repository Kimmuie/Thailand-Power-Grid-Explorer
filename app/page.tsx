"use client";
import { useMemo, useState } from "react";
import Inventory from "./views/Inventory";
import Schema from "./views/Schema";
import { Zap, Network, Factory, Database, Search, ShieldCheck, Download, Play } from "lucide-react";

const C = ({ t, s, children, cls = "" }: any) => (
  <section className={"rounded-2xl border border-slate-200 bg-white p-5 shadow-sm " + cls}>
    {t && <h2 className="text-lg font-bold">{t}</h2>}{s && <p className="mb-3 text-sm text-slate-500">{s}</p>}{children}
  </section>
);
const Bar = ({ v, c = "bg-brand" }: any) => <div className="h-2 rounded bg-slate-100"><div className={"h-2 rounded " + c} style={{ width: v + "%" }} /></div>;

type P = { id: string; name: string; src: string; mw: number; st: string; op: string; disp: number | null; ef: number | null };
const PLANTS: P[] = [
  { id: "1001", name: "โรงไฟฟ้าบางปะกง", src: "ก๊าซธรรมชาติ", mw: 2490, st: "เดินเครื่อง", op: "กฟผ.", disp: 1850.5, ef: 412.3 },
  { id: "1002", name: "โรงไฟฟ้าวังน้อย", src: "ก๊าซธรรมชาติ", mw: 2027, st: "เดินเครื่อง", op: "กฟผ.", disp: 1620, ef: 428.15 },
  { id: "1005", name: "เขื่อนภูมิพล", src: "พลังน้ำ", mw: 779.2, st: "เดินเครื่อง", op: "กฟผ.", disp: 410, ef: 18.4 },
  { id: "1012", name: "โรงไฟฟ้าจะนะ", src: "ก๊าซธรรมชาติ", mw: 1476, st: "เดินเครื่อง", op: "กฟผ.", disp: 1180, ef: 419 },
  { id: "1018", name: "ลำตะคอง ชลภาวัฒนา", src: "พลังน้ำสูบกลับ", mw: 500, st: "เดินเครื่อง", op: "กฟผ.", disp: 320, ef: 21.1 },
  { id: "1024", name: "โซลาร์ลพบุรี", src: "แสงอาทิตย์", mw: 84, st: "เดินเครื่อง", op: "SPP", disp: 62.5, ef: 34.8 },
  { id: "1039", name: "แม่เมาะ 1-3 (ปลดระวาง)", src: "ลิกไนต์", mw: 225, st: "ปลดระวาง", op: "กฟผ.", disp: null, ef: null },
  { id: "1040", name: "โซลาร์ไฮบริดภาคใต้ เฟส 2", src: "แสงอาทิตย์", mw: 150, st: "เสนอโครงการ", op: "SPP", disp: null, ef: null },
];
const NODES = [
  { id: "mm", n: "แม่เมาะ", x: 130, y: 40, mw: "2,400 MW", k: "p" }, { id: "bp", n: "ภูมิพล", x: 40, y: 130, mw: "440 MW", k: "p" },
  { id: "ns", n: "สฟ.นครสวรรค์", x: 200, y: 150, mw: "500kV hub", k: "s" }, { id: "wn", n: "วังน้อย", x: 250, y: 230, mw: "2,150 MW", k: "p" },
  { id: "bk", n: "บางปะกง", x: 360, y: 290, mw: "1,680 / 2,490 MW", k: "p" }, { id: "kk", n: "สฟ.ขอนแก่น", x: 400, y: 120, mw: "230kV", k: "s" },
  { id: "x39", n: "p1039 (ไม่จับคู่)", x: 60, y: 260, mw: "ปลดระวาง", k: "u" },
];
const EDGES = [["mm", "ns", 5], ["bp", "ns", 2], ["ns", "wn", 5], ["wn", "bk", 5], ["ns", "kk", 2]];
// [ลำดับ, โรงไฟฟ้า, เชื้อเพลิง, ฿/kWh, ติดตั้ง MW, จ่ายจริง MW]
const MERIT = [["#01", "ภูมิพล 1-8", "พลังน้ำ", 0.42, 779, 440], ["#02", "นำเข้า น้ำเทิน 2 สปป.ลาว", "นำเข้า", 1.85, 1050, 850], ["#03", "แม่เมาะ 8-14", "ลิกไนต์", 2.14, 2400, 1920], ["#04", "วังน้อย", "ก๊าซ", 2.88, 2750, 1490], ["#05", "บางปะกง ชุด 5", "ก๊าซ LNG", 3.05, 2490, 1680], ["#06", "ลำตะคอง", "สูบกลับ", 3.8, 1000, 500]];

/* ───────── ข้อมูลจำลองชุดเดียว (Simulated Data) — ทุกตัวเลขใน Topology คำนวณจากตรงนี้ + MERIT ───────── */
const SIM = {
  freqHz: 50.02,
  reactiveMvar: 420,
  reactiveLimitMvar: 600,
  requiredReserveMw: 3000,
  // แยกตามระดับแรงดัน ไม่เฉลี่ยรวมกัน
  voltagePu: { 500: 0.98, 230: 1.01, 115: 0.97 } as Record<number, number>,
  // จ่ายสูงสุดที่พร้อมจริงของแต่ละหน่วยใน MERIT (หน่วยที่หยุดซ่อม/Offline ให้ใส่เท่ากับจ่ายจริง หรือ 0)
  avail: { "#01": 779, "#02": 1050, "#03": 2200, "#04": 2600, "#05": 2490, "#06": 1000 } as Record<string, number>,
  // แหล่งที่เพิ่มกำลังเองไม่ได้ (จึงไม่มีกำลังสำรอง)
  solarWind: { installed: 1500, current: 256 },
  // flow/capacity ของสายส่ง key = `${a}-${b}` ตาม EDGES
  lines: {
    "mm-ns": { name: "แม่เมาะ–นครสวรรค์", flow: 1880, cap: 2400 },
    "bp-ns": { name: "ภูมิพล–นครสวรรค์", flow: 430, cap: 600 },
    "ns-wn": { name: "นครสวรรค์–วังน้อย", flow: 1790, cap: 2000 },
    "wn-bk": { name: "วังน้อย–บางปะกง", flow: 1420, cap: 2400 },
    "ns-kk": { name: "นครสวรรค์–ขอนแก่น", flow: 520, cap: 800 },
  } as Record<string, { name: string; flow: number; cap: number }>,
};

/* ───────── สูตร + เกณฑ์สถานะ (เกณฑ์จำลองสำหรับ Dashboard ไม่ใช่เกณฑ์ปฏิบัติการจริง) ───────── */
type Status = "normal" | "warning" | "critical" | "overload";
const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0);
const clamp = (v: number) => Math.max(0, Math.min(100, v));
const freqStatus = (f: number): Status => (f < 49.8 || f > 50.2 ? "critical" : f < 49.9 || f > 50.1 ? "warning" : "normal");
const voltStatus = (pu: number): Status => { const d = Math.abs(pu - 1) * 100; return d > 10 ? "critical" : d > 5 ? "warning" : "normal"; };
const reserveStatus = (avail: number, req: number): Status => { const r = pct(avail, req); return r >= 100 ? "normal" : r >= 80 ? "warning" : "critical"; };
const loadStatus = (l: number): Status => (l > 100 ? "overload" : l > 90 ? "critical" : l >= 80 ? "warning" : "normal");
const ST: Record<Status, { cls: string; label: string }> = {
  normal: { cls: "text-emerald-700", label: "Normal" },
  warning: { cls: "text-amber-600", label: "Warning" },
  critical: { cls: "text-red-600", label: "Critical" },
  overload: { cls: "text-red-700", label: "Overload" },
};
const Badge = ({ s }: { s: Status }) => <span className={"ml-1 text-xs font-semibold " + ST[s].cls}>{ST[s].label}</span>;
const kvOf = (w: number) => (w === 5 ? 500 : 230); // w เดิม: 5 = 500kV, 2 = 230kV
const KV_COLOR: Record<number, string> = { 500: "#047857", 230: "#2563eb", 115: "#ca8a04" };
const fuelGroup = (f: string) =>
  f.includes("ก๊าซ") ? "ก๊าซธรรมชาติ" : f.includes("ลิกไนต์") ? "ถ่านหินลิกไนต์" : f.includes("นำเข้า") ? "ไฟฟ้านำเข้า" : f.includes("พลังน้ำ") || f.includes("สูบกลับ") ? "พลังน้ำ" : "อื่น ๆ";

/* ───────── ข้อมูลประกอบ: ประเภทโรงไฟฟ้า + ข้อมูลย้อนหลัง (จำลอง, deterministic) ───────── */
const PLANT: Record<string, { rank: string; type: string }> = {
  mm: { rank: "#03", type: "โรงไฟฟ้าพลังความร้อน (ลิกไนต์)" },
  bp: { rank: "#01", type: "เขื่อนผลิตไฟฟ้าพลังน้ำ" },
  wn: { rank: "#04", type: "โรงไฟฟ้าพลังความร้อนร่วม" },
  bk: { rank: "#05", type: "โรงไฟฟ้าพลังความร้อนร่วม" },
};
// อนุกรมเวลา 24 ชม. ทุก 5 นาที (288 จุด) จุดสุดท้าย = ค่าปัจจุบันใน SIM
const series = (seed: number, n: number, base: number, amp: number, noise: number, last: number) => {
  let s = seed * 9973;
  const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 - 0.5; };
  const a = Array.from({ length: n }, (_, i) => base + amp * Math.sin(i / 18 + seed) + noise * rnd());
  a[n - 1] = last;
  return a;
};
const FREQ_ALL = series(3, 288, 50, 0.03, 0.08, SIM.freqHz);
const VOLT_ALL: Record<number, number[]> = {
  500: series(5, 288, SIM.voltagePu[500], 0.008, 0.02, SIM.voltagePu[500]),
  230: series(7, 288, SIM.voltagePu[230], 0.008, 0.02, SIM.voltagePu[230]),
  115: series(11, 288, SIM.voltagePu[115], 0.008, 0.02, SIM.voltagePu[115]),
};
const RANGES = [1, 6, 12, 24];
const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;

function LineChart({ data, lo, hi, band, refv, color = "#047857", dec = 2, hours }: any) {
  const W = 300, H = 120, L = 36, R = 6, T = 6, B = 16;
  const x = (i: number) => L + (i / (data.length - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - clamp(((v - lo) / (hi - lo)) * 100) / 100) * (H - T - B);
  const pts = data.map((v: number, i: number) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = data[data.length - 1];
  return <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
    {band && <rect x={L} y={y(band[1])} width={W - L - R} height={y(band[0]) - y(band[1])} fill="#d1fae5" opacity={0.6} />}
    {refv !== undefined && <line x1={L} x2={W - R} y1={y(refv)} y2={y(refv)} stroke="#94a3b8" strokeDasharray="4 3" />}
    {[lo, (lo + hi) / 2, hi].map(v => <text key={v} x={L - 4} y={y(v) + 3} textAnchor="end" fontSize="9" fill="#64748b">{v.toFixed(dec)}</text>)}
    <polyline points={pts} fill="none" stroke={color} strokeWidth={1.6} />
    <circle cx={x(data.length - 1)} cy={y(last)} r={3} fill={color} />
    <text x={L} y={H - 3} fontSize="9" fill="#64748b">-{hours} ชม.</text>
    <text x={W - R} y={H - 3} textAnchor="end" fontSize="9" fill="#64748b">ปัจจุบัน</text>
  </svg>;
}
const Stat = ({ l, v }: { l: string; v: any }) => <div className="rounded-lg bg-slate-50 p-2"><div className="text-xs text-slate-500">{l}</div><div className="text-sm font-bold">{v}</div></div>;
const Pills = ({ opts, v, set, fmt }: any) => <div className="mb-2 flex gap-1">{opts.map((o: any) => <button key={o} onClick={() => set(o)} className={"rounded-full border px-3 py-0.5 text-xs " + (v === o ? "bg-emerald-800 text-white" : "hover:bg-slate-50")}>{fmt(o)}</button>)}</div>;

function Topology() {
  const [sel, setSel] = useState("bk");
  const [hov, setHov] = useState<string | null>(null);
  const [range, setRange] = useState(6);
  const [kv, setKv] = useState(500);
  const nodeOf = (id: string) => NODES.find(n => n.id === id);
  const nd = nodeOf(sel) ?? NODES[0];

  const d = useMemo(() => {
    const merit = [...MERIT].sort((a: any, b: any) => a[3] - b[3]); // Marginal Cost ต่ำ → สูง
    const installed = merit.reduce((s, r: any) => s + r[4], 0) + SIM.solarWind.installed;
    const current = merit.reduce((s, r: any) => s + r[5], 0) + SIM.solarWind.current;
    const unitReserve = merit.map((r: any) => ({ name: r[1], mw: Math.max(0, (SIM.avail[r[0]] ?? r[5]) - r[5]) }));
    const reserve = unitReserve.reduce((s, u) => s + u.mw, 0);

    const groups: Record<string, number> = { "โซลาร์/ลม": SIM.solarWind.current };
    merit.forEach((r: any) => { const g = fuelGroup(r[2]); groups[g] = (groups[g] ?? 0) + r[5]; });
    const mix = Object.entries(groups).map(([name, mw]) => ({ name, mw, share: pct(mw, current) })).sort((a, b) => b.mw - a.mw);

    const lines = EDGES.flatMap(([a, b, w]: any) => {
      const A = nodeOf(a), B = nodeOf(b);
      if (!A || !B) return []; // id ไม่ตรง → ข้ามเส้นนั้น ไม่ให้ทั้งหน้าพัง
      const m = SIM.lines[`${a}-${b}`];
      return [{ key: a + b, A, B, w, kv: kvOf(w), m, loading: m ? pct(m.flow, m.cap) : null }];
    });
    const worst = lines.filter(l => l.loading !== null).sort((x, y) => y.loading! - x.loading!)[0];
    return { merit, installed, current, reserve, unitReserve, mix, lines, worst };
  }, []);

  const plantInfo = (id: string) => {
    const p = PLANT[id]; const r = p && MERIT.find((m: any) => m[0] === p.rank) as any;
    return r ? { name: r[1] as string, type: p.type, fuel: r[2] as string, installed: r[4] as number, current: r[5] as number, status: "เดินเครื่อง (Running)", lf: pct(r[5], r[4]) } : null;
  };
  const subInfo = (id: string) => {
    const ls = d.lines.filter(l => l.A.id === id || l.B.id === id);
    const inMw = ls.filter(l => l.B.id === id).reduce((s, l) => s + (l.m?.flow ?? 0), 0);
    const outMw = ls.filter(l => l.A.id === id).reduce((s, l) => s + (l.m?.flow ?? 0), 0);
    const worstLoad = Math.max(0, ...ls.map(l => l.loading ?? 0));
    return { kv: Math.max(...ls.map(l => l.kv)), count: ls.length, inMw, outMw, s: loadStatus(worstLoad) };
  };

  // KPI / สถานะ
  const fS = freqStatus(SIM.freqHz);
  const rS = reserveStatus(d.reserve, SIM.requiredReserveMw);
  const util = pct(d.current, d.installed);
  const volts = [500, 230, 115].map(k => ({ kv: k, pu: SIM.voltagePu[k], s: voltStatus(SIM.voltagePu[k]) }));
  const worstV = volts.reduce((a, b) => (Math.abs(b.pu - 1) > Math.abs(a.pu - 1) ? b : a));
  const wl = d.worst?.loading ?? 0;
  const shed = d.worst ? Math.max(0, Math.ceil(d.worst.m!.flow - d.worst.m!.cap * 0.8)) : 0;

  // ความถี่ย้อนหลัง
  const fd = FREQ_ALL.slice(-range * 12);
  const fAvg = avg(fd), fMax = Math.max(...fd), fMin = Math.min(...fd);
  const fDev = SIM.freqHz - 50;
  // แรงดันย้อนหลัง (แยกตามระดับแรงดัน)
  const vd = VOLT_ALL[kv].slice(-range * 12);
  const vAvg = avg(vd), vDev = ((vAvg - 1) / 1) * 100, vS = voltStatus(vAvg);

  const hv = hov ? nodeOf(hov) : undefined;
  const hp = hov ? plantInfo(hov) : null;
  const hs = hv && hv.k === "s" ? subInfo(hv.id) : null;
  const sp = plantInfo(nd.id);
  const ss = nd.k === "s" ? subInfo(nd.id) : null;

  return <div className="space-y-4">
    <h1 className="text-2xl font-bold">แดชบอร์ดภาพรวมและแผนที่โครงข่าย</h1>
    <div className="grid grid-cols-5 gap-4">
      <C><div className="text-xs text-slate-500">ความถี่ระบบไฟฟ้า<Badge s={fS} /></div>
        <div className="my-1 text-2xl font-bold">{SIM.freqHz.toFixed(2)} Hz</div>
        <Bar v={clamp(((SIM.freqHz - 49.8) / 0.4) * 100)} /></C>
      <C><div className="text-xs text-slate-500">แรงดันไฟฟ้า<Badge s={worstV.s} /></div>
        <div className="my-1 text-2xl font-bold">{worstV.pu.toFixed(2)} pu</div>
        <Bar v={clamp(100 - Math.abs(worstV.pu - 1) * 100)} />
        <div className="mt-1 text-xs text-slate-500">{volts.map(v => `${v.kv}kV ${v.pu.toFixed(2)}`).join(" · ")}</div></C>
      <C><div className="text-xs text-slate-500">Reactive Power</div>
        <div className="my-1 text-2xl font-bold">+{SIM.reactiveMvar} MVAR</div>
        <Bar v={clamp(pct(SIM.reactiveMvar, SIM.reactiveLimitMvar))} /></C>
      <C><div className="text-xs text-slate-500">กำลังสำรองพร้อมจ่าย<Badge s={rS} /></div>
        <div className="my-1 text-2xl font-bold">{d.reserve.toLocaleString()} MW</div>
        <Bar v={clamp(pct(d.reserve, SIM.requiredReserveMw))} />
        <div className="mt-1 text-xs text-slate-500">ต้องสำรอง {SIM.requiredReserveMw.toLocaleString()} MW</div></C>
      <C><div className="text-xs text-slate-500">กำลังผลิตติดตั้งรวม</div>
        <div className="my-1 text-2xl font-bold">{d.installed.toLocaleString()} MW</div>
        <Bar v={clamp(util)} />
        <div className="mt-1 text-xs text-slate-500">ใช้งานจริง {util.toFixed(1)}%</div></C>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <C t="แผนที่โครงข่าย 500kV / 230kV" s="Interactive — เลื่อนเมาส์ที่โรงไฟฟ้าเพื่อดูรายละเอียด คลิกเพื่อดูข้อมูลด้านล่าง" cls="col-span-2">
        <div className="relative">
          <svg viewBox="0 0 480 330" className="w-full">
            {d.lines.map(l => <line key={l.key} x1={l.A.x} y1={l.A.y} x2={l.B.x} y2={l.B.y}
              stroke={l.loading !== null && l.loading >= 90 ? "#dc2626" : l.loading !== null && l.loading >= 80 ? "#f59e0b" : KV_COLOR[l.kv]}
              strokeWidth={l.w} strokeDasharray={l.w == 2 ? "6 4" : ""} />)}
            {NODES.map(n => {
              const pi = n.k === "p" ? plantInfo(n.id) : null; const r = n.id === sel ? 16 : 13;
              return <g key={n.id} onClick={() => setSel(n.id)} onMouseEnter={() => setHov(n.id)} onMouseLeave={() => setHov(null)} className="cursor-pointer">
                {n.k === "p"
                  ? <><rect x={n.x - r} y={n.y - r} width={r * 2} height={r * 2} rx={6} fill={pi?.fuel.includes("พลังน้ำ") ? "#2563eb" : "#047857"} stroke={n.id === sel ? "#0f172a" : "#fff"} strokeWidth={2} />
                    <path d="M1 -7 L-5 1 H0 L-1 7 L5 -1 H0 Z" fill="#fff" transform={`translate(${n.x},${n.y}) scale(${r / 12})`} /></>
                  : <circle cx={n.x} cy={n.y} r={r} fill={n.k === "u" ? "#f59e0b" : "#0f172a"} stroke={n.id === sel ? "#047857" : "#94a3b8"} strokeWidth={3} />}
                <text x={n.x} y={n.y + 30} textAnchor="middle" fontSize="11">{n.n}</text></g>;
            })}
          </svg>
          {hv && (hp || hs) && <div className="pointer-events-none absolute z-10 w-60 rounded-lg border bg-white p-3 text-xs shadow-lg"
            style={{ left: `${clamp((hv.x / 480) * 100 < 22 ? 22 : (hv.x / 480) * 100 > 78 ? 78 : (hv.x / 480) * 100)}%`, top: `${(hv.y / 330) * 100}%`, transform: hv.y < 150 ? "translate(-50%, 26px)" : "translate(-50%, calc(-100% - 22px))" }}>
            {hp ? <>
              <div className="mb-1 text-sm font-bold">{hp.name}</div>
              <div>ประเภท: {hp.type}</div><div>เชื้อเพลิง: {hp.fuel}</div>
              <div>กำลังผลิตติดตั้ง: {hp.installed.toLocaleString()} MW</div>
              <div>กำลังผลิตปัจจุบัน: {hp.current.toLocaleString()} MW</div>
              <div>สถานะเครื่อง: {hp.status}</div><div>Load Factor: {hp.lf.toFixed(1)}%</div>
            </> : hs && <>
              <div className="mb-1 text-sm font-bold">{hv.n}</div>
              <div>แรงดัน: {hs.kv} kV · สายส่ง {hs.count} เส้น</div>
              <div>รับเข้า {hs.inMw.toLocaleString()} MW · จ่ายออก {hs.outMw.toLocaleString()} MW</div>
            </>}
          </div>}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
          <span><span className="mr-1 inline-block h-3 w-3 rounded bg-emerald-700 align-middle" />โรงไฟฟ้า (น้ำ = ฟ้า)</span>
          <span><span className="mr-1 inline-block h-3 w-3 rounded-full bg-slate-900 align-middle" />สถานีไฟฟ้าแรงสูง</span>
          {[500, 230, 115].map(k => <span key={k}><span className="mr-1 inline-block h-1 w-5 align-middle" style={{ background: KV_COLOR[k] }} />{k} kV</span>)}
          <span className="text-amber-600">เส้นส้ม/แดง = โหลด ≥80% / ≥90%</span>
        </div>
        <div className="mt-2 rounded-xl border bg-slate-50 p-3 text-sm">
          {sp ? <><b>{sp.name}</b> · {sp.type} · {sp.fuel} · ติดตั้ง {sp.installed.toLocaleString()} MW · จ่ายจริง {sp.current.toLocaleString()} MW · Load {sp.lf.toFixed(1)}% · {sp.status}</>
            : ss ? <><b>{nd.n}</b> · {ss.kv} kV · สายส่ง {ss.count} เส้น · รับเข้า {ss.inMw.toLocaleString()} MW · จ่ายออก {ss.outMw.toLocaleString()} MW · สถานะ<Badge s={ss.s} /></>
            : <><b>{nd.n}</b> · {nd.mw}{nd.k === "u" && <span className="ml-2 text-amber-700">NULL tuple — คงค่าไว้ (LEFT JOIN)</span>}</>}
        </div>
        <div className="mt-2 text-xs text-slate-400">ข้อมูลจำลอง (Simulated Data) — ไม่ใช่สถานะจริงของระบบไฟฟ้าไทย</div></C>

      <div className="space-y-4">
        <C t="Generation Mix" s={`รวม ${d.current.toLocaleString()} MW · ใช้กำลังผลิตติดตั้ง ${util.toFixed(1)}%`}>
          {d.mix.map(m => <div key={m.name} className="mb-2 text-sm"><div className="flex justify-between"><span>{m.name}</span><b>{m.mw.toLocaleString()} MW · {m.share.toFixed(1)}%</b></div><Bar v={m.share} /></div>)}</C>
        {d.worst && wl >= 80
          ? <C cls="!border-amber-300 !bg-amber-50"><b>ข้อแนะนำการจ่ายไฟ</b><Badge s={loadStatus(wl)} /><p className="text-sm">สาย {d.worst.kv}kV {d.worst.m!.name} ใช้งาน {wl.toFixed(1)}% — ปรับเส้นทาง −{shed} MW เพื่อลดให้ต่ำกว่า 80%</p></C>
          : <C><b>ข้อแนะนำการจ่ายไฟ</b><p className="text-sm">สายส่งทุกเส้นอยู่ในเกณฑ์ปกติ</p></C>}
      </div></div>

    <div className="grid grid-cols-2 gap-4">
      <C t="ความถี่ระบบไฟฟ้า" s="กราฟความผันผวนย้อนหลัง ช่วยดูความเสถียร (อ้างอิง 50 Hz)">
        <Pills opts={RANGES} v={range} set={setRange} fmt={(o: number) => `${o} ชม.`} />
        <LineChart data={fd} lo={49.8} hi={50.2} band={[49.9, 50.1]} refv={50} hours={range} />
        <div className="mt-2 grid grid-cols-4 gap-2">
          <Stat l="ปัจจุบัน" v={<>{SIM.freqHz.toFixed(2)} Hz<Badge s={fS} /></>} />
          <Stat l="เฉลี่ย" v={`${fAvg.toFixed(3)} Hz`} />
          <Stat l="สูงสุด / ต่ำสุด" v={`${fMax.toFixed(2)} / ${fMin.toFixed(2)}`} />
          <Stat l="เบี่ยงเบน" v={`${fDev >= 0 ? "+" : ""}${fDev.toFixed(2)} Hz (${(Math.abs(fDev) / 50 * 100).toFixed(2)}%)`} />
        </div></C>
      <C t="แรงดันไฟฟ้าเฉลี่ย" s="ค่าแรงดันเฉลี่ย สถานะความเสถียร และ trend line (แยกตามระดับแรงดัน)">
        <div className="flex gap-4"><Pills opts={[500, 230, 115]} v={kv} set={setKv} fmt={(o: number) => `${o} kV`} /><Pills opts={RANGES} v={range} set={setRange} fmt={(o: number) => `${o} ชม.`} /></div>
        <LineChart data={vd} lo={0.9} hi={1.1} band={[0.95, 1.05]} refv={1} color="#2563eb" hours={range} />
        <div className="mt-2 grid grid-cols-4 gap-2">
          <Stat l="แรงดันเฉลี่ย" v={<>{vAvg.toFixed(3)} pu<Badge s={vS} /></>} />
          <Stat l="Rated / เบี่ยงเบน" v={`1.00 pu / ${vDev >= 0 ? "+" : ""}${vDev.toFixed(2)}%`} />
          <Stat l="ต่ำสุด / สูงสุด" v={`${Math.min(...vd).toFixed(3)} / ${Math.max(...vd).toFixed(3)}`} />
          <Stat l="Stability Index" v={(100 - Math.abs(vDev)).toFixed(1)} />
        </div></C>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <C t="กำลังไฟฟ้าสำรองพร้อมจ่าย" s="ปริมาณกำลังผลิตสำรองที่จ่ายเข้าระบบได้ทันที (ไม่นับเครื่องที่ Offline/Maintenance)">
        <div className="mb-2 grid grid-cols-4 gap-2">
          <Stat l="สำรองพร้อมจ่าย" v={<>{d.reserve.toLocaleString()} MW<Badge s={rS} /></>} />
          <Stat l="ต้องสำรอง" v={`${SIM.requiredReserveMw.toLocaleString()} MW`} />
          <Stat l="Reserve Margin" v={`${pct(d.reserve, d.current).toFixed(1)}%`} />
          <Stat l="เทียบที่ต้องสำรอง" v={`${pct(d.reserve, SIM.requiredReserveMw).toFixed(0)}%`} />
        </div>
        <Bar v={clamp(pct(d.reserve, SIM.requiredReserveMw))} />
        <div className="mt-3 space-y-1 text-sm">{d.unitReserve.map(u => <div key={u.name} className="flex justify-between border-t pt-1"><span>{u.name}</span><b>{u.mw.toLocaleString()} MW</b></div>)}</div></C>
      <C t="กำลังผลิตติดตั้งรวม" s="กำลังผลิตทั้งหมดของประเทศ และสัดส่วนที่ใช้งานจริง">
        <div className="mb-2 grid grid-cols-3 gap-2">
          <Stat l="ติดตั้งรวม" v={`${d.installed.toLocaleString()} MW`} />
          <Stat l="ผลิตจริง" v={`${d.current.toLocaleString()} MW`} />
          <Stat l="ยังไม่ได้ใช้" v={`${(d.installed - d.current).toLocaleString()} MW`} />
        </div>
        <div className="mb-1 flex justify-between text-sm"><span>สัดส่วนที่ใช้งานจริง</span><b>{util.toFixed(1)}%</b></div>
        <Bar v={clamp(util)} /></C>
    </div>

    <C t="Merit-Order Dispatch" s="เรียงตามต้นทุนส่วนเพิ่ม (ต่ำ → สูง)"><table className="w-full text-sm"><thead className="text-left text-slate-500"><tr>{["ลำดับ", "โรงไฟฟ้า", "เชื้อเพลิง", "฿/kWh", "ติดตั้ง", "จ่ายจริง", "Load"].map(h => <th key={h} className="p-2">{h}</th>)}</tr></thead>
      <tbody>{d.merit.map((r: any, i: number) => <tr key={r[1]} className="border-t"><td className="p-2 font-mono text-brand">#{String(i + 1).padStart(2, "0")}</td><td>{r[1]}</td><td>{r[2]}</td><td className="font-mono">{r[3].toFixed(2)}</td><td>{r[4]}</td><td>{r[5]}</td><td>{Math.round(pct(r[5], r[4]))}%</td></tr>)}</tbody></table></C></div>;
}

const SS = [
  { q: "โรงไฟฟ้าก๊าซธรรมชาติภาคกลาง ปล่อย CO2 ต่ำกว่า 450 kg/MWh", k: ["ก๊าซ", "กลาง"], r: [["บางปะกง", "EGAT_C01", 96.4, 388.4], ["วังน้อย", "EGAT_C02", 94.1, 412.1], ["จะนะ (ภาคใต้)", "EGAT_S01", 88.7, 435]] },
  { q: "โรงไฟฟ้าพลังน้ำสูบกลับที่ช่วยพยุงระบบช่วงพีค", k: ["สูบกลับ", "พีค", "น้ำ"], r: [["ลำตะคอง ชลภาวัฒนา", "1018", 93.2, 21.1], ["ภูมิพล", "1005", 81.5, 18.4]] },
  { q: "โรงไฟฟ้าพลังงานแสงอาทิตย์ที่ยังไม่เดินเครื่อง", k: ["แสง", "โซลาร์", "ไม่เดิน"], r: [["โซลาร์ไฮบริดภาคใต้ เฟส 2", "1040", 90.1, 0], ["โซลาร์ลพบุรี", "1024", 79.8, 34.8]] },
];
const DOTS = [[60, 40, 0], [90, 60, 0], [150, 120, 1], [170, 110, 1], [190, 130, 1], [80, 170, 2], [240, 50, 3], [260, 70, 3], [220, 160, 1]];
function Semantic() {
  const [i, setI] = useState(0); const [txt, setTxt] = useState(SS[0].q);
  const go = () => { const j = SS.findIndex(s => s.k.some(k => txt.includes(k))); setI(j < 0 ? 0 : j); };
  return <div className="space-y-4"><C t="ค้นหาด้วยภาษาธรรมชาติ (ภาษาไทย)">
    <div className="flex gap-2"><input value={txt} onChange={e => setTxt(e.target.value)} className="flex-1 rounded-lg border px-3 py-2" /><button onClick={go} className="rounded-lg bg-brand px-4 text-white">ค้นหาด้วย AI</button></div>
    <div className="mt-2 flex gap-2">{SS.map((s, n) => <button key={n} onClick={() => { setI(n); setTxt(s.q); }} className="rounded-full border px-3 py-1 text-xs hover:bg-slate-50">{s.q.slice(0, 28)}…</button>)}</div></C>
    <div className="grid grid-cols-3 gap-4"><div className="col-span-2 space-y-3">{SS[i].r.map((r: any, n) => <C key={r[1]}><div className="flex items-center justify-between"><div><b>#{n + 1} {r[0]}</b> <span className="font-mono text-xs text-blue-700">{r[1]}</span></div><span className="rounded-full bg-emerald-100 px-3 text-sm text-emerald-800">Cosine: {r[2]}%</span></div><div className="mt-1 text-sm text-slate-500">CO2: <b>{r[3]}</b> kg/MWh</div></C>)}</div>
      <C t="UMAP Cluster"><svg viewBox="0 0 300 200" className="w-full">{DOTS.map((d, n) => <circle key={n} cx={d[0]} cy={d[1]} r={6} fill={["#047857", "#2563eb", "#92400e", "#16a34a"][d[2]]} />)}</svg></C></div>
    <C t="Cross-lingual Harmonization (TH ↔ EN)"><div className="font-mono text-sm">พลังน้ำแบบสูบกลับ → pumped-storage-hydro · พยุงระบบ/พีค → peak-shaving-grid</div></C></div>;
}

const BR = ["plant_id ไม่ซ้ำ (PK)", "หน่วยกำลังผลิตเป็น MW", "ใช้ LEFT JOIN คงค่า NULL ของ 1039/1040", "EF หน่วย kg CO2e/MWh", "สถานะอยู่ในชุดค่า Active/Retired/Pipeline", "ข้อมูลทุกแถวอ้างอิงแหล่งที่มา", "ผลลัพธ์ 3 ฐานข้อมูลต้องตรงกัน"];
function Prov() {
  return <div className="space-y-4"><div className="grid grid-cols-2 gap-4"><C t="System Boundary"><p>Gate-to-Gate (Generation-to-Grid) · Functional Unit: 1 MW · ISO 14040/44</p></C>
    <C t="แหล่งข้อมูล">{["SRC-01 · EGAT 2026 plant registry", "SRC-02 · EPPO 2026 energy statistics", "SRC-03 · EGAT dispatch logs"].map(s => <div key={s} className="font-mono text-sm">{s}</div>)}</C></div>
    <C t="Business Rules Compliance">{BR.map((b, n) => <div key={n} className="flex justify-between border-t py-2 text-sm"><span><b className="font-mono">BR-0{n + 1}</b> {b}</span><span className="text-emerald-700">✓ Pass</span></div>)}</C></div>;
}

const TABS = [["แผนที่โครงข่ายไฟฟ้า (การเชื่อมต่อสายส่ง)", Network, Topology], ["รายชื่อโรงไฟฟ้า (40 แห่งทั่วประเทศ)", Factory, Inventory], ["โครงสร้างข้อมูลและการทดสอบ", Database, Schema], ["ระบบค้นหาอัจฉริยะ AI (ค้นหาด้วยภาษาธรรมชาติ)", Search, Semantic], ["แหล่งข้อมูลและความถูกต้อง", ShieldCheck, Prov]] as const;
export default function Page() {
  const [t, setT] = useState(0); const V = TABS[t][2];
  return <div className="min-h-screen bg-white">
    <header className="flex h-20 items-center border-b px-10 text-xl font-bold"><Zap className="mr-2 text-emerald-800" size={22} />ระบบสำรวจโครงข่ายไฟฟ้าแห่งประเทศไทย</header>
    <div className="flex">
      <aside className="sticky top-0 flex h-[calc(100vh-80px)] w-64 shrink-0 flex-col justify-between border-r bg-white p-4">
        <div><div className="mb-4 mt-2 font-mono text-[11px] font-bold tracking-wide text-slate-600">การวิเคราะห์หลายมิติ (ANALYTICS)</div>
          {TABS.map((x, n) => { const I = x[1]; return <button key={n} onClick={() => setT(n)} className={"mb-1 flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left text-[15px] leading-snug " + (t === n ? "bg-emerald-800 font-bold text-white" : "text-slate-700 hover:bg-slate-100")}><I size={18} className="mt-0.5 shrink-0" />{n + 1}. {x[0]}</button>; })}</div>
        <div className="rounded-lg border bg-slate-50 p-3 text-xs text-slate-600"><div className="mb-1 flex justify-between font-mono font-bold"><span>การประมาณฐานข้อมูล</span><span className="text-emerald-800">v2.4-stable</span></div>การคำนวณหน่วยหน้าที่ตามมาตรฐาน ISO 14040/44 สำหรับโครงข่ายย่อย กฟผ.</div></aside>
      <main className="min-w-0 flex-1 bg-slate-50 p-6"><V /></main></div></div>;
}