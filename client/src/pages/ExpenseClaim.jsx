import { useEffect, useState } from "react"; import { useNavigate, useSearchParams } from "react-router-dom"; import api, { err, inr, fd } from "../services/api"; import DocRows, { EXTRA, typesFor, validFile } from "../components/DocRows";
const CATS = ["Flight", "Train", "Hotel", "Food", "Local Transport", "Conference", "Other"];
const DECL = "I confirm these bills are genuine, relate to this business trip, and have not been claimed elsewhere.";
const item = () => ({ category: "Food", amount: "", date: "", description: "", vendor: "", invoiceNo: "", billAmount: "", billDate: "", gstin: "", employeeNote: "", docs: [], noReceipt: false, missingReason: "" });
export default function ExpenseClaim() {
  const nav = useNavigate(); const [q] = useSearchParams(); const [trips, setTrips] = useState([]); const [pols, setPols] = useState([]); const [trip, setTrip] = useState(q.get("trip") || "");
  const [items, setItems] = useState([item()]); const [e, setE] = useState(""); const [busy, setBusy] = useState(false); const [agree, setAgree] = useState(false);
  useEffect(() => { api.get("/travel").then((r) => setTrips(r.data.filter((x) => ["Approved", "Trip Completed"].includes(x.status)))); api.get("/policies").then((r) => setPols(r.data)).catch(() => {}); }, []);
  const up = (i, k, v) => setItems(items.map((x, j) => (j === i ? { ...x, [k]: v } : x))); const sel = trips.find((x) => x._id === trip); const sum = items.reduce((s, x) => s + (+x.amount || 0), 0);
  const polOf = (x) => pols.find((p) => p.category === x.category); const files = (x) => x.docs.filter((d) => d.file);
  const needOf = (x) => { const p = polOf(x); return [...(p?.requiredDocs || []), ...(p && p.extraProofAbove > 0 && +x.amount > p.extraProofAbove ? [EXTRA] : [])]; };
  const canDeclare = (x) => { const p = polOf(x); return p?.noReceiptLimit > 0 && +x.amount > 0 && +x.amount <= p.noReceiptLimit; };
  const declared = (x) => x.noReceipt && canDeclare(x) && !files(x).length;
  const missing = (x) => (declared(x) ? [] : needOf(x).filter((r) => !files(x).some((d) => d.docType.toLowerCase() === r.toLowerCase())));
  const problems = items.flatMap((x, i) => [...(missing(x).length ? [`${x.category} (item ${i + 1}): add ${missing(x).join(", ")}`] : []), ...(declared(x) && !x.missingReason.trim() ? [`${x.category} (item ${i + 1}): explain why there is no receipt`] : [])]);
  const pickFor = (i, label) => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".pdf,.jpg,.jpeg,.png";
    inp.onchange = () => { const f = inp.files[0]; if (!f) return; if (!validFile(f)) { setE(`"${f.name}" can't be used. Choose a PDF, JPG or PNG file up to 5 MB.`); return; } setE("");
      setItems((cur) => cur.map((x, j) => (j === i ? { ...x, docs: [...x.docs, { id: Math.random(), docType: label, file: f }] } : x))); }; inp.click(); };
  const submit = async () => { setE(""); setBusy(true); try { if (!trip) throw { message: "Select a trip" }; if (items.some((x) => !x.amount || !x.date)) throw { message: "Each expense needs an amount and date" };
    const fdata = new FormData(); const expenses = items.map((x, i) => { const ds = files(x); ds.forEach((d, j) => fdata.append(`doc_${i}_${j}`, d.file));
      return { category: x.category, amount: x.amount, date: x.date, description: x.description, vendor: x.vendor, invoiceNo: x.invoiceNo, billAmount: x.billAmount, billDate: x.billDate, gstin: x.gstin, employeeNote: x.employeeNote, docs: ds.map((d) => ({ docType: d.docType })), missingReason: declared(x) ? x.missingReason : "" }; });
    fdata.append("data", JSON.stringify({ travelRequestId: trip, expenses, declaration: agree })); const { data } = await api.post("/claims", fdata); nav(`/claims/${data._id}`); } catch (x) { setE(err(x)); } setBusy(false); };
  return (<div className="card p-6 max-w-3xl"><h1 className="font-display text-2xl text-navy mb-5">New Expense Claim</h1>
    <label className="lbl">Related trip</label><select className="inp mb-2" value={trip} onChange={(x) => setTrip(x.target.value)}><option value="">Select an approved trip</option>{trips.map((t) => <option key={t._id} value={t._id}>{t.code} — {t.destination}</option>)}</select>
    {sel && <p className="text-sm text-muted mb-4">Travel dates: {fd(sel.startDate)} – {fd(sel.endDate)}</p>}
    {items.map((x, i) => { const p = polOf(x), need = needOf(x), miss = missing(x); return (<div key={i} className="border border-beige2 rounded-md p-4 mb-3 grid sm:grid-cols-4 gap-3">
      <div><label className="lbl">Category</label><select className="inp" value={x.category} onChange={(v) => up(i, "category", v.target.value)}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div><label className="lbl">Amount (₹)</label><input type="number" min="0" className="inp" value={x.amount} onChange={(v) => up(i, "amount", v.target.value)} /></div>
      <div><label className="lbl">Date</label><input type="date" className="inp" value={x.date} onChange={(v) => up(i, "date", v.target.value)} /></div>
      <div><label className="lbl">Description</label><input className="inp" value={x.description} onChange={(v) => up(i, "description", v.target.value)} /></div>
      <div className="sm:col-span-4 border-t border-beige2 pt-3"><div className="text-xs text-muted mb-2">Proof for this expense</div>
        {need.length > 0 && <div className="flex flex-wrap gap-2 mb-2">{need.map((r) => { const ok = files(x).some((d) => d.docType.toLowerCase() === r.toLowerCase()); return ok ? <span key={r} className="text-xs rounded-full px-2.5 py-0.5 border bg-emerald-50 border-emerald-200 text-emerald-800">✓ {r}</span> : <button type="button" key={r} onClick={() => pickFor(i, r)} className="text-xs rounded-full px-2.5 py-0.5 border bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100">⬆ Upload {r}</button>; })}</div>}
        {p && p.extraProofAbove > 0 && <p className="text-[11px] text-muted mb-2">Items above {inr(p.extraProofAbove)} in this category also need a “{EXTRA}”.</p>}
        <DocRows docs={x.docs} types={typesFor(p)} required={need} onChange={(d) => up(i, "docs", d)} onError={setE} />
        {canDeclare(x) && !files(x).length && <label className="flex items-start gap-2 text-sm mt-3"><input type="checkbox" className="mt-1" checked={x.noReceipt} onChange={(v) => up(i, "noReceipt", v.target.checked)} /><span>I don't have a receipt for this item (allowed up to {inr(p.noReceiptLimit)}). I declare it is a genuine business expense.</span></label>}
        {declared(x) && <textarea className="inp mt-2" rows="2" maxLength="300" placeholder="Why is there no receipt? (required)" value={x.missingReason} onChange={(v) => up(i, "missingReason", v.target.value)} />}
        {miss.length > 0 && <p className="text-xs text-amber-800 mt-2">⚠ Still needed: {miss.join(", ")}</p>}</div>
      <div className="sm:col-span-4 grid sm:grid-cols-4 gap-3 border-t border-beige2 pt-3"><div className="sm:col-span-4 text-xs text-muted">Bill details: helps your reviewers verify the receipt quickly</div>
        <div><label className="lbl">Vendor / merchant</label><input className="inp" value={x.vendor} onChange={(v) => up(i, "vendor", v.target.value)} /></div>
        <div><label className="lbl">Bill / invoice no.</label><input className="inp" value={x.invoiceNo} onChange={(v) => up(i, "invoiceNo", v.target.value)} /></div>
        <div><label className="lbl">Amount on bill (₹)</label><input type="number" min="0" className="inp" value={x.billAmount} onChange={(v) => up(i, "billAmount", v.target.value)} /></div>
        <div><label className="lbl">Bill date</label><input type="date" className="inp" value={x.billDate} onChange={(v) => up(i, "billDate", v.target.value)} /></div>
        <div className="sm:col-span-2"><label className="lbl">GSTIN (optional)</label><input className="inp" maxLength="15" value={x.gstin} onChange={(v) => up(i, "gstin", v.target.value.toUpperCase())} /></div>
        {x.billAmount !== "" && x.amount !== "" && Math.abs(+x.billAmount - +x.amount) > 0.5 && <p className="sm:col-span-2 text-xs text-amber-800 self-end">⚠ The bill amount differs from the amount you are claiming.</p>}
        {x.billDate && x.date && x.billDate !== x.date && <p className="sm:col-span-4 text-xs text-amber-800">⚠ The bill date differs from the expense date.</p>}</div>
      <div className="sm:col-span-4"><label className="lbl">Message to your reviewer (optional, sent with this bill)</label>
        <textarea className="inp" rows="2" maxLength="500" placeholder="e.g. The taxi receipt is on the back of the hotel invoice." value={x.employeeNote} onChange={(v) => up(i, "employeeNote", v.target.value)} /><div className="text-[11px] text-muted text-right">{x.employeeNote.length}/500</div></div>
      {items.length > 1 && <div className="sm:col-span-4 text-right"><button className="text-red-800 underline text-sm" onClick={() => setItems(items.filter((_, j) => j !== i))}>Delete item</button></div>}</div>); })}
    <button className="btn2 mb-5" onClick={() => setItems([...items, item()])}>+ Add expense</button>
    <div className="bg-beige rounded p-3 mb-4 flex justify-between"><span className="text-muted">Total Claim Amount</span><b className="text-navy">{inr(sum)}</b></div>
    <label className="flex items-start gap-2 text-sm mb-4"><input type="checkbox" className="mt-1" checked={agree} onChange={(v) => setAgree(v.target.checked)} /><span>{DECL}</span></label>
    {problems.length > 0 && <ul className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded p-3 list-disc list-inside">{problems.map((p) => <li key={p}>{p}</li>)}</ul>}
    {e && <div role="alert" className="mb-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded p-2">{e}</div>}
    <button className="btn disabled:opacity-50" disabled={busy || !agree || problems.length > 0} onClick={submit}>{busy ? "Submitting…" : "Submit Expense Claim"}</button></div>);
}
