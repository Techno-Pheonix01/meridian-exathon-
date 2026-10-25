import { useEffect, useState } from "react"; import { Link } from "react-router-dom"; import { useAuth } from "../context/AuthContext";
import api, { inr, fd } from "../services/api"; import { Badge, Stat, Table, Section, Empty } from "../components/ui";
export default function Dashboard() {
  const { user } = useAuth(); const [t, setT] = useState([]); const [c, setC] = useState([]);
  useEffect(() => { Promise.all([api.get("/travel"), api.get("/claims")]).then(([a, b]) => { setT(a.data); setC(b.data); }); }, []);
  const h = new Date().getHours(); const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; const r = user.role;
  const mon = (d) => new Date(d).getMonth() === new Date().getMonth();
  const sum = (a) => a.reduce((s, x) => s + x.totalAmount, 0);
  const stats = { employee: [["Active Trips", t.filter((x) => ["Approved", "Trip Completed"].includes(x.status)).length], ["Pending Approvals", t.filter((x) => x.status === "Pending Manager Approval").length + c.filter((x) => x.status.includes("Review")).length], ["Total Expenses", inr(sum(c))], ["Reimbursed Amount", inr(sum(c.filter((x) => x.status === "Paid")))]],
    manager: [["Pending Travel Requests", t.filter((x) => x.status === "Pending Manager Approval").length], ["Pending Expense Claims", c.filter((x) => x.status === "Under Manager Review").length], ["Approved This Month", t.filter((x) => x.status !== "Pending Manager Approval" && x.status !== "Rejected" && mon(x.updatedAt)).length], ["Team Travel Spending", inr(t.filter((x) => !["Rejected", "Returned for Changes", "Pending Manager Approval"].includes(x.status)).reduce((s, x) => s + x.estimatedCost, 0))]],
    finance: [["Pending Finance Review", c.filter((x) => x.status === "Under Finance Review").length], ["Approved for Payment", c.filter((x) => x.status === "Approved for Payment").length], ["Paid This Month", c.filter((x) => x.status === "Paid" && mon(x.updatedAt)).length], ["Total Reimbursement", inr(sum(c.filter((x) => x.status === "Paid")))]],
    admin: [["Travel Requests", t.length], ["Expense Claims", c.length], ["Pending Claims", c.filter((x) => x.status.includes("Review")).length], ["Total Claimed", inr(sum(c))]] }[r];
  const isClaims = r === "finance";
  return (<div><h1 className="font-display text-2xl text-navy">{greet}, {user.name.split(" ")[0]}</h1><p className="text-muted mb-6">Here's an overview of your travel and reimbursement activity.</p>
    {r === "employee" && c.filter((x) => x.status === "Proof Requested").map((x) => <div key={x._id} className="mb-4 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded p-3">⚠ <b>{x.code}</b> needs more proof from you. <Link className="underline" to={`/claims/${x._id}`}>Upload documents</Link></div>)}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">{stats.map(([l, v]) => <Stat key={l} label={l} value={v} />)}</div>
    {!isClaims ? <Section title={r === "employee" ? "Recent Travel Requests" : "Travel Requests"} action={r === "employee" && <Link to="/travel/new" className="btn">+ New Travel Request</Link>}>
      <Table cols={r === "employee" ? ["Request ID", "Destination", "Travel Dates", "Estimated Cost", "Status", "Action"] : ["Request ID", "Employee", "Destination", "Travel Dates", "Estimated Cost", "Status", "Review"]}
        rows={t.slice(0, 8).map((x) => r === "employee" ? [x.code, x.destination, `${fd(x.startDate)} – ${fd(x.endDate)}`, inr(x.estimatedCost), <Badge s={x.status} />, <Link className="text-navy2 underline" to={`/travel/${x._id}`}>View</Link>]
          : [x.code, x.employeeId?.name, x.destination, `${fd(x.startDate)} – ${fd(x.endDate)}`, inr(x.estimatedCost), <Badge s={x.status} />, <Link className="text-navy2 underline" to={`/travel/${x._id}`}>{r === "manager" ? "Review" : "View"}</Link>])}
        empty={<Empty text="No travel requests yet." to={r === "employee" ? "/travel/new" : null} cta="Create your first request" />} /></Section> : null}
    {(r !== "employee" && r !== "manager" || r === "manager") && <Section title={r === "finance" ? "Claims for Finance" : "Expense Claims"}>
      <Table cols={["Claim ID", "Employee", "Trip", "Amount", "Policy", "Status", "Action"]} rows={c.slice(0, 8).map((x) => [x.code, x.employeeId?.name, x.travelRequestId?.destination, inr(x.totalAmount),
        x.expenses.some((e) => e.policyFlag) ? <span className="text-amber-800">Flagged</span> : <span className="text-emerald-800">Clear</span>, <Badge s={x.status} />, <Link className="text-navy2 underline" to={`/claims/${x._id}`}>{r === "employee" ? "View" : "Review"}</Link>])} empty={<Empty text="No expense claims." />} /></Section>}</div>);
}
