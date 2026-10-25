import { useEffect, useState } from "react"; import { Link, useSearchParams } from "react-router-dom"; import { useAuth } from "../context/AuthContext";
import api, { inr, fd } from "../services/api"; import { Badge, Table, Section, Empty } from "../components/ui";
export default function Lists({ kind }) {
  const { user } = useAuth(); const [rows, setRows] = useState([]); const [q] = useSearchParams(); const [s, setS] = useState("");
  useEffect(() => { api.get("/" + kind).then((r) => setRows(r.data)); }, [kind]);
  const list = rows.filter((x) => (!q.get("paid") || x.status === "Paid") && JSON.stringify(x).toLowerCase().includes(s.toLowerCase()));
  const t = kind === "travel";
  return (<Section title={t ? (user.role === "employee" ? "My Travel" : "Travel Requests") : (q.get("paid") ? "Reimbursements" : "Expense Claims")}
    action={<div className="flex flex-wrap gap-2"><input className="inp !w-40 sm:!w-48" placeholder="Search" value={s} onChange={(e) => setS(e.target.value)} />
      {user.role === "employee" && <Link className="btn" to={t ? "/travel/new" : "/claims/new"}>{t ? "+ New Travel Request" : "+ New Expense Claim"}</Link>}</div>}>
    {t ? <Table cols={["ID", "Employee", "Destination", "Dates", "Cost", "Status", ""]} rows={list.map((x) => [x.code, x.employeeId?.name, x.destination, `${fd(x.startDate)} – ${fd(x.endDate)}`, inr(x.estimatedCost), <Badge s={x.status} />, <Link className="text-navy2 underline" to={`/travel/${x._id}`}>Open</Link>])} empty={<Empty text="Nothing here yet." />} />
      : <Table cols={["ID", "Employee", "Trip", "Amount", "Status", ""]} rows={list.map((x) => [x.code, x.employeeId?.name, x.travelRequestId?.destination, inr(x.totalAmount), <Badge s={x.status} />, <Link className="text-navy2 underline" to={`/claims/${x._id}`}>Open</Link>])} empty={<Empty text="No claims yet." />} />}</Section>);
}
