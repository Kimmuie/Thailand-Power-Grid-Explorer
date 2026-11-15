"use client";
import { useState } from "react";
import { Zap, Search, Download, CheckCircle2, TriangleAlert, Flame, Droplets, Sun, Network } from "lucide-react";
const R: any[] = [
  ["1001", "โรงไฟฟ้าบางปะกง", "อ.เชิงเทรา, ภาคกลาง", "ก๊าซธรรมชาติ", 2490, "ปกติ", "กฟผ. (รัฐ)", 1850.5, 412.3],
  ["1002", "โรงไฟฟ้าวังน้อย", "อยุธยา, ภาคกลาง", "ก๊าซธรรมชาติ", 2027, "ปกติ", "กฟผ. (รัฐ)", 1620, 428.15],
  ["1005", "โรงไฟฟ้าพลังน้ำเขื่อนภูมิพล", "ตาก, ภาคเหนือ", "พลังน้ำ", 779.2, "ปกติ", "กฟผ. (รัฐ)", 410, 18.4],
  ["1012", "โรงไฟฟ้าจะนะ", "สงขลา, ภาคใต้", "ก๊าซธรรมชาติ", 1476, "ปกติ", "กฟผ. (รัฐ)", 1180, 419],
  ["1018", "โรงไฟฟ้าพลังน้ำลำตะคองชลภาวัฒนา", "นครราชสีมา, อีสาน", "พลังน้ำสูบกลับ", 500, "ปกติ", "กฟผ. (รัฐ)", 320, 21.1],
  ["1024", "โรงไฟฟ้าพลังงานแสงอาทิตย์ลพบุรี", "ลพบุรี, ภาคกลาง", "พลังงานแสงอาทิตย์", 84, "ปกติ", "SPP (เอกชน)", 62.5, 34.8],
  ["1039", "แม่เมาะ เครื่องที่ 1-3 (ปลดระวางแล้ว)", "ลำปาง, ภาคเหนือ · หน่วยหยุดเดินเครื่อง", "ลิกไนต์", 225, "ปลดระวางแล้ว", "ไม่ระบุ (ออฟไลน์)", null, null],
  ["1040", "โรงไฟฟ้าพลังงานแสงอาทิตย์ไฮบริดภาคใต้ เฟส 2", "สุราษฎร์ธานี, ภาคใต้ · แผน COD 2570", "พลังงานแสงอาทิตย์ไฮบริด", 150, "เสนอโครงการ", "รอเริ่มจ่ายไฟ", null, null],
];
const Bars = [["ก๊าซธรรมชาติ (โรงไฟฟ้าฐาน)", 5063, "68.0%", 24, 68, "bg-blue-700"], ["พลังน้ำและพลังน้ำสูบกลับ", 1117, "15.0%", 6, 15, "bg-blue-500"], ["ถ่านหินลิกไนต์ / ซับบิทูมินัส", 820, "11.0%", 3, 11, "bg-amber-800"], ["พลังงานแสงอาทิตย์และชีวมวล", 446, "6.0%", 7, 6, "bg-emerald-800"]];
const pill = (s: string) => s === "ปกติ" ? "bg-emerald-200 text-emerald-900" : s === "ปลดระวางแล้ว" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-800";
export default function Inventory() {
  const [q, setQ] = useState(""), [src, setSrc] = useState(""), [mode, setMode] = useState("all");
  const rows = R.filter(r => (r[1] + r[0] + r[6]).includes(q) && (!src || r[3] === src) && (mode === "all" || r[5] === "ปกติ"));
  const nul = (v: any) => <span className="rounded bg-amber-700 px-2 py-0.5 text-xs font-bold text-white">ค่าว่าง (NULL)</span>;
  const exp = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([R.map(r => r.join(",")).join("\n")])); a.download = "lci_summary.csv"; a.click(); };
  return <div className="space-y-5 text-slate-800">
    <div className="flex items-center justify-between text-sm text-slate-600"><span>• ภาพรวมกำลังการผลิตแห่งชาติ · ติดตามข้อมูลโรงไฟฟ้าหลัก <b>40 แห่งทั่วประเทศ</b> ทั้งพลังงานฟอสซิลและพลังงานหมุนเวียน</span>
      <span className="flex gap-3"><span className="flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5"><Zap size={14} className="text-blue-600" />กำลังการผลิตสูงสุด: <b className="font-mono text-blue-700">7,446 MW</b></span><span className="flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5"><CheckCircle2 size={14} className="text-emerald-700" />แหล่งอ้างอิง: ทะเบียน กฟผ. / สนพ.</span></span></div>
    <div className="grid grid-cols-2 gap-5">
      <div className="rounded-xl border bg-white p-5"><div className="mb-4 flex items-start justify-between border-b pb-3"><h2 className="text-xl font-bold">สัดส่วนกำลังการผลิตตามประเภทเชื้อเพลิง (Generation Capacity by Energy Source)</h2><span className="rounded bg-indigo-50 px-2 py-1 font-mono text-[10px] text-blue-700">ปรับเทียบ EPPO</span></div>
        {Bars.map((b: any) => <div key={b[0]} className="mb-3"><div className="mb-1 flex justify-between text-sm"><b>● {b[0]}</b><span className="font-mono text-slate-600">{b[1].toLocaleString()} MW ({b[2]} • {b[3]} โรง)</span></div><div className="h-2 rounded bg-slate-100"><div className={"h-2 rounded " + b[5]} style={{ width: b[4] + "%" }} /></div></div>)}</div>
      <div className="rounded-xl border bg-white p-5"><h2 className="mb-4 border-b pb-3 text-xl font-bold">สถานะการดำเนินงานและความพร้อมของระบบ (Operational Status)</h2>
        <div className="grid grid-cols-3 gap-3 text-center">{[["เดินเครื่องปกติ (ACTIVE)", 38, "95.0%", "ส่งข้อมูลออนไลน์", "bg-emerald-50 text-emerald-800"], ["ปลดระวางแล้ว (RETIRED)", 1, "2.5%", "หน่วยที่หยุดเดินเครื่อง", "bg-orange-50 text-amber-800"], ["โครงการในอนาคต (PIPELINE)", 1, "2.5%", "มีแผนเปิดจ่ายไฟปี 2570", "bg-blue-50 text-blue-800"]].map((s: any) => <div key={s[0]} className={"rounded-lg border p-3 " + s[4]}><div className="font-mono text-[10px]">{s[0]}</div><div className="text-4xl font-bold">{s[1]}</div><div className="text-xs">{s[2]}</div><div className="text-[11px] text-slate-600">{s[3]}</div></div>)}</div>
        <div className="mt-3 rounded-lg bg-indigo-50 p-3 text-xs"><b>✓ สรุปสำหรับผู้บริหาร</b><br />โรงไฟฟ้าทั้งหมด 100% ถูกบันทึกไว้ในระบบครบถ้วน การคงข้อมูลโรงไฟฟ้าที่ปลดระวางและโครงการในอนาคตช่วยป้องกันการบิดเบือนบัญชีรายการคาร์บอนและรองรับการพยากรณ์การลดคาร์บอนอย่างแม่นยำ</div></div></div>
    <div className="flex items-center gap-3 rounded-xl border bg-white p-3 text-sm">
      <div className="relative flex-1"><Search size={15} className="absolute left-3 top-2.5 text-slate-500" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหาด้วยชื่อโรงไฟฟ้า, จังหวัด, รหัส หรือผู้ดำเนินการ..." className="w-full rounded-lg border bg-slate-50 py-2 pl-9 pr-3" /></div>
      <select value={src} onChange={e => setSrc(e.target.value)} className="rounded-lg border px-3 py-2"><option value="">ทุกประเภทเชื้อเพลิง (40 แห่ง)</option>{[...new Set(R.map(r => r[3]))].map(s => <option key={s}>{s}</option>)}</select>
      <select className="rounded-lg border px-3 py-2"><option>ผู้ดำเนินการทั้งหมด (กฟผ. และเอกชน)</option></select>
      <span className="text-xs font-bold">โหมดแสดงผล:</span><div className="flex overflow-hidden rounded-lg border text-xs">{[["all", "ทั้งหมด"], ["act", "เฉพาะเดินเครื่อง"]].map(m => <button key={m[0]} onClick={() => setMode(m[0])} className={"px-3 py-2 " + (mode === m[0] ? "bg-blue-50 font-bold text-blue-700" : "")}>{m[1]}</button>)}</div>
      <button onClick={exp} className="flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2.5 font-bold text-white"><Download size={15} />ดาวน์โหลดรายงานสรุป (Export Summary)</button></div>
    <div className="overflow-hidden rounded-xl border bg-white"><div className="flex items-center justify-between px-5 py-4"><h2 className="text-xl font-bold">ตารางบัญชีรายการ LCI โรงไฟฟ้า (Gate-to-Gate Matrix)</h2><span className="font-mono text-[11px] text-slate-600"><span className="text-emerald-600">●●</span> ข้อมูลเชื่อมโยงครบถ้วน <span className="text-amber-600">●●</span> คงค่าโรงไฟฟ้าที่ยังไม่เดินเครื่อง (NULL Tuple)</span></div>
      <table className="w-full text-sm"><thead className="bg-indigo-50 text-left font-mono text-[10px] text-slate-600"><tr>{["รหัสโรงไฟฟ้า (PLANT ID)", "ชื่อโรงไฟฟ้าและสถานที่ตั้ง (POWER PLANT & LOCATION)", "แหล่งพลังงาน (ENERGY SOURCE)", "กำลังผลิตติดตั้ง (CAPACITY MW)", "สถานะการทำงาน (OPERATIONAL STATUS)", "ผู้ดำเนินการ (OPERATOR)", "กำลังจ่ายไฟจริง (DISPATCHED OUTPUT MW)", "อัตราปล่อยก๊าซ (EMISSIONS FACTOR KG CO2E/MWH)", "สถานะการตรวจสอบ (GRID AUDIT STATUS)"].map(h => <th key={h} className="px-3 py-3 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{rows.map(r => { const n = r[7] === null; return <tr key={r[0]} className={"border-t " + (n ? "bg-orange-50" : "")}>
          <td className={"px-3 py-4 font-mono " + (n ? "text-amber-800" : "text-blue-700")}>{r[0]}</td>
          <td className="px-3"><div className="flex gap-1 font-bold">{n && (r[5] === "ปลดระวางแล้ว" ? <TriangleAlert size={14} className="mt-1 shrink-0 text-amber-700" /> : null)}{r[1]}</div><div className="text-xs text-slate-500">{r[2]}</div></td>
          <td className="px-3"><span className={"inline-flex items-center gap-1 rounded px-2 py-1 text-xs " + (n || r[3].includes("แสง") ? "bg-orange-100 text-amber-900" : "bg-blue-50 text-blue-800")}>{r[3].includes("แสง") ? <Sun size={12} /> : r[3].includes("น้ำ") ? <Droplets size={12} /> : <Flame size={12} />}{r[3]}</span></td>
          <td className="px-3 text-right font-mono font-bold">{r[4].toFixed(2)}</td>
          <td className="px-3"><span className={"rounded-full px-2 py-0.5 text-xs font-bold " + pill(r[5])}>● {r[5] === "ปกติ" ? "เดินเครื่องปกติ" : r[5]}</span></td>
          <td className="px-3">{r[6]}</td>
          <td className="px-3 text-right font-mono">{n ? nul(0) : r[7].toFixed(2)}</td>
          <td className="px-3 text-right font-mono">{n ? nul(0) : <span className={r[8] > 100 ? "text-amber-800" : "text-emerald-700"}>{r[8].toFixed(2)}</span>}</td>
          <td className="px-3 text-center">{n ? <span className="rounded bg-orange-200 px-2 py-1 text-xs font-bold text-amber-900">คงค่าไว้ (Preserved)</span> : <span className="rounded bg-emerald-50 px-2 py-1 font-mono text-[11px] text-emerald-800">ตรวจสอบแล้ว (3NF)</span>}</td></tr>; })}</tbody></table>
      <div className="flex items-center justify-between border-t px-5 py-3 text-xs"><span>แสดง <b>1 ถึง {rows.length}</b> จากทั้งหมด <b>40 รายการ</b> (จับคู่ข้อมูลสมบูรณ์ 38 รายการ, ค่าแถวข้อมูลภายนอก 2 รายการในโหมด LEFT JOIN)</span>
        <span className="flex items-center gap-2"><Network size={14} />ดูโมเดลเชิงสัมพันธ์ 3NF {[1, 2, 3, 4, 5].map(p => <span key={p} className={"rounded px-2 py-1 " + (p === 1 ? "bg-blue-50 font-bold text-blue-700" : "")}>{p}</span>)}</span></div></div></div>;
}
