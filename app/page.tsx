"use client";
import { useState } from "react";
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
const MERIT = [["#01", "ภูมิพล 1-8", "พลังน้ำ", 0.42, 779, 440], ["#02", "นำเข้า น้ำเทิน 2 สปป.ลาว", "นำเข้า", 1.85, 1050, 850], ["#03", "แม่เมาะ 8-14", "ลิกไนต์", 2.14, 2400, 1920], ["#04", "วังน้อย", "ก๊าซ", 2.88, 2750, 1490], ["#05", "บางปะกง ชุด 5", "ก๊าซ LNG", 3.05, 2490, 1680], ["#06", "ลำตะคอง", "สูบกลับ", 3.8, 1000, 500]];

function Topology() {
  const [sel, setSel] = useState("bk");
  const nd = NODES.find(n => n.id === sel)!;
  const g = (id: string) => NODES.find(n => n.id === id)!;
  const kpi = [["ความถี่", "50.02 Hz", 62], ["เสถียรภาพแรงดัน", "0.98 pu", 90], ["Reactive Power", "+420 MVAR", 70], ["Spinning Reserve", "5,640 MW", 76]];
  return <div className="space-y-4">
    <div className="grid grid-cols-4 gap-4">{kpi.map(k => <C key={k[0]}><div className="text-xs text-slate-500">{k[0]}</div><div className="my-1 text-3xl font-bold">{k[1]}</div><Bar v={k[2]} /></C>)}</div>
    <div className="grid grid-cols-3 gap-4">
      <C t="แผนที่โครงข่าย 500kV / 230kV" cls="col-span-2"><svg viewBox="0 0 480 330" className="w-full">
        {EDGES.map(([a, b, w]: any) => <line key={a + b} x1={g(a).x} y1={g(a).y} x2={g(b).x} y2={g(b).y} stroke={w == 5 ? "#047857" : "#2563eb"} strokeWidth={w} strokeDasharray={w == 2 ? "6 4" : ""} />)}
        {NODES.map(n => <g key={n.id} onClick={() => setSel(n.id)} className="cursor-pointer">
          <circle cx={n.x} cy={n.y} r={n.id === sel ? 16 : 12} fill={n.k === "u" ? "#f59e0b" : n.k === "s" ? "#0f172a" : "#fff"} stroke={n.k === "p" ? "#047857" : "#94a3b8"} strokeWidth={3} />
          <text x={n.x} y={n.y + 28} textAnchor="middle" fontSize="11">{n.n}</text></g>)}
      </svg>
        <div className="rounded-xl border bg-slate-50 p-3 text-sm"><b>{nd.n}</b> · {nd.mw}{nd.k === "u" && <span className="ml-2 text-amber-700">NULL tuple — คงค่าไว้ (LEFT JOIN)</span>}</div></C>
      <div className="space-y-4">
        <C t="Generation Mix">{[["ก๊าซธรรมชาติ", 3170, 56.2], ["ถ่านหินลิกไนต์", 1920, 34], ["พลังน้ำ+นำเข้า", 1790, 31.7], ["โซลาร์/ลม", 256, 4.5]].map(m => <div key={m[0] as string} className="mb-2 text-sm"><div className="flex justify-between"><span>{m[0]}</span><b>{(m[1] as number).toLocaleString()} MW</b></div><Bar v={m[2]} /></div>)}</C>
        <C cls="!border-amber-300 !bg-amber-50"><b>ข้อแนะนำการจ่ายไฟ</b><p className="text-sm">สาย 500kV นครสวรรค์–วังน้อย ใช้งาน 89.5% — ปรับเส้นทาง −120 MW</p></C>
      </div></div>
    <C t="Merit-Order Dispatch" s="เรียงตามต้นทุนส่วนเพิ่ม"><table className="w-full text-sm"><thead className="text-left text-slate-500"><tr>{["ลำดับ", "โรงไฟฟ้า", "เชื้อเพลิง", "฿/kWh", "ติดตั้ง", "จ่ายจริง", "Load"].map(h => <th key={h} className="p-2">{h}</th>)}</tr></thead>
      <tbody>{MERIT.map((r: any) => <tr key={r[0]} className="border-t"><td className="p-2 font-mono text-brand">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td className="font-mono">{r[3].toFixed(2)}</td><td>{r[4]}</td><td>{r[5]}</td><td>{Math.round(r[5] / r[4] * 100)}%</td></tr>)}</tbody></table></C></div>;
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
  const [t, setT] = useState(1); const V = TABS[t][2];
  return <div className="min-h-screen bg-white">
    <header className="flex h-20 items-center border-b px-10 text-xl font-bold"><Zap className="mr-2 text-emerald-800" size={22} />ระบบสำรวจโครงข่ายไฟฟ้าแห่งประเทศไทย</header>
    <div className="flex">
      <aside className="sticky top-0 flex h-[calc(100vh-80px)] w-64 shrink-0 flex-col justify-between border-r bg-white p-4">
        <div><div className="mb-4 mt-2 font-mono text-[11px] font-bold tracking-wide text-slate-600">การวิเคราะห์หลายมิติ (ANALYTICS)</div>
          {TABS.map((x, n) => { const I = x[1]; return <button key={n} onClick={() => setT(n)} className={"mb-1 flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left text-[15px] leading-snug " + (t === n ? "bg-emerald-800 font-bold text-white" : "text-slate-700 hover:bg-slate-100")}><I size={18} className="mt-0.5 shrink-0" />{n + 1}. {x[0]}</button>; })}</div>
        <div className="rounded-lg border bg-slate-50 p-3 text-xs text-slate-600"><div className="mb-1 flex justify-between font-mono font-bold"><span>การประมาณฐานข้อมูล</span><span className="text-emerald-800">v2.4-stable</span></div>การคำนวณหน่วยหน้าที่ตามมาตรฐาน ISO 14040/44 สำหรับโครงข่ายย่อย กฟผ.</div></aside>
      <main className="min-w-0 flex-1 bg-slate-50 p-6"><V /></main></div></div>;
}
