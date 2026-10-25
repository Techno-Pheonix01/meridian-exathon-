import { useRef, useState } from "react";
export const EXTRA = "Supporting document";
export const typesFor = (p) => [...new Set([...(p?.requiredDocs || []), EXTRA, "Other"])];
export const validFile = (f) => /\.(pdf|jpe?g|png)$/i.test(f.name) && f.size <= 5e6;
// Upload area (click, or drag and drop from your computer) plus the list of attached documents
export default function DocRows({ docs, types, required = [], onChange, onError }) {
  const ref = useRef(); const [over, setOver] = useState(false);
  const set = (id, patch) => onChange(docs.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  const addFiles = (list) => { let next = [...docs]; let msg = "";
    for (const f of Array.from(list || [])) { if (next.length >= 5) { msg = "You can attach up to 5 documents per item."; break; } if (!validFile(f)) { msg = `"${f.name}" can't be used. Choose a PDF, JPG or PNG file up to 5 MB.`; continue; }
      next = [...next, { id: Math.random(), docType: [...required, ...types].find((t) => !next.some((d) => d.docType === t)) || "Other", file: f }]; }
    onChange(next); onError(msg); };
  return (<div>
    {docs.map((d) => (<div key={d.id} className="flex flex-wrap items-center gap-2 text-sm mb-2 border border-beige2 rounded p-2 bg-white/50">
      <span className="text-emerald-800 break-all">📎 {d.file.name} <span className="text-muted">({Math.max(1, Math.round(d.file.size / 1024))} KB)</span></span>
      <select className="inp !w-52 ml-auto" aria-label={`Document type for ${d.file.name}`} value={d.docType} onChange={(v) => set(d.id, { docType: v.target.value })}>{types.map((t) => <option key={t}>{t}</option>)}</select>
      <button type="button" className="text-red-800 underline text-xs" onClick={() => onChange(docs.filter((z) => z.id !== d.id))}>Remove</button></div>))}
    {docs.length < 5 && <div role="button" tabIndex={0} onClick={() => ref.current.click()} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), ref.current.click())}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}
      className={`cursor-pointer text-center text-sm rounded border-2 border-dashed p-4 ${over ? "border-navy bg-beige" : "border-beige2 hover:bg-beige/60"}`}>
      <div className="font-medium text-navy">⬆ Upload from your computer</div><div className="text-xs text-muted">Click to browse, or drag and drop · PDF, JPG or PNG · up to 5 MB each</div></div>}
    <input ref={ref} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" aria-label="Upload documents" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
  </div>);
}
