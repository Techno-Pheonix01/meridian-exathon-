import { useEffect, useState } from "react"; import { useParams, Link } from "react-router-dom"; import { useAuth } from "../context/AuthContext"; import api, { err, inr, fd, fdt } from "../services/api"; import { Badge } from "../components/ui";
export const Timeline = ({ steps, current }) => (<div className="flex flex-wrap gap-y-3 my-4">{steps.map((s, i) => <div key={s} className="flex items-center">
  <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${i <= current ? "bg-navy text-white" : "bg-beige2 text-muted"}`}>{i < current ? "✓" : i + 1}</div>
  <span className={`ml-2 text-xs ${i <= current ? "text-navy font-medium" : "text-muted"}`}>{s}</span>{i < steps.length - 1 && <div className="w-6 h-px bg-beige2 mx-2" />}</div>)}</div>);
export const History = ({ items }) => (<div className="card p-4"><h3 className="font-display text-lg text-navy mb-3">Approval History</h3>{items?.length ? items.map((a, i) => <div key={i} className="border-b border-beige2 py-2 text-sm last:border-0">
  <b>{a.name}</b> <span className="text-muted capitalize">({a.role})</span> — {a.action}<div className="text-muted text-xs">{fdt(a.timestamp)}</div>{a.comment && <div className="mt-1 italic">“{a.comment}”</div>}</div>) : <p className="text-muted text-sm">No activity yet.</p>}</div>);
export default function TravelDetails() {
  const { id } = useParams(); const { user } = useAuth(); const [t, setT] = useState(); const [c, setC] = useState(""); const [e, setE] = useState(""); const [claim, setClaim] = useState();
  const load = () => api.get("/travel/" + id).then((r) => setT(r.data)).catch(() => setT(null)); useEffect(() => { load(); api.get("/claims").then((r) => setClaim(r.data.find((x) => x.travelRequestId?._id === id))); }, [id]);
  if (t === null) return <p>This travel request was not found, or you don't have access to it.</p>; if (!t) return <p>Loading…</p>;
  const act = async (p, body) => { setE(""); try { await api.post(`/travel/${id}/${p}`, body); setC(""); load(); } catch (x) { setE(err(x)); } };
  const steps = ["Submitted", "Manager Review", "Approved", "Trip Completed", "Expense Submitted", "Manager Review ", "Finance Review", "Paid"];
  const cs = claim?.status; const cur = cs === "Paid" ? 7 : cs === "Under Finance Review" || cs === "Approved for Payment" ? 6 : cs ? 5 : t.status === "Expense Submitted" ? 4 : t.status === "Trip Completed" ? 3 : t.status === "Approved" ? 2 : t.status === "Pending Manager Approval" ? 1 : 0;
  const row = ([k, v]) => <div key={k}><div className="text-xs text-muted">{k}</div><div className="text-sm">{v}</div></div>;
  return (<div><div className="flex items-center gap-3 mb-4"><h1 className="font-display text-2xl text-navy">{t.code} · {t.destination}</h1><Badge s={t.status} /></div>
    <div className="card p-5 mb-5"><Timeline steps={steps} current={cur} /><div className="grid sm:grid-cols-3 gap-4 mt-4">
      {[["Employee", t.employeeId?.name], ["Department", t.employeeId?.department], ["Dates", `${fd(t.startDate)} – ${fd(t.endDate)}`], ["Purpose", t.purpose], ["Travel mode", t.travelMode],
        ["Accommodation", t.accommodation?.required ? `${t.accommodation.hotel}, ${t.accommodation.nights} nights` : "Not required"], ["Estimated cost", inr(t.estimatedCost)], ["Project code", t.projectCode || "—"]].map(row)}</div></div>
    {e && <div className="mb-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded p-2">{e}</div>}
    {user.role === "employee" && <div className="flex gap-3 mb-5">
      {["Draft", "Returned for Changes"].includes(t.status) && <><Link className="btn2" to={`/travel/${id}/edit`}>Edit</Link><button className="btn" onClick={() => act("submit")}>{t.status === "Draft" ? "Submit Request" : "Resubmit"}</button></>}
      {t.status === "Approved" && <button className="btn" onClick={() => act("complete")}>Mark Trip Completed</button>}
      {["Approved", "Trip Completed"].includes(t.status) && <Link className="btn2" to={`/claims/new?trip=${id}`}>Add Expenses</Link>}</div>}
    {user.role === "manager" && t.status === "Pending Manager Approval" && <div className="card p-4 mb-5"><label className="lbl">Comment (required to reject or return)</label>
      <textarea className="inp mb-3" rows="2" placeholder="Please provide a valid business justification." value={c} onChange={(x) => setC(x.target.value)} />
      <div className="flex gap-3"><button className="btn" onClick={() => act("review", { action: "approve", comment: c })}>Approve</button><button className="btn2" onClick={() => act("review", { action: "return", comment: c })}>Return for Changes</button>
        <button className="btn2 !border-red-800 !text-red-800" onClick={() => act("review", { action: "reject", comment: c })}>Reject</button></div></div>}
    <History items={t.approvals} /></div>);
}
