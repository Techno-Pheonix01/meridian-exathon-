import { useEffect, useState } from "react"; import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"; import api, { inr } from "../services/api"; import { Stat, Section } from "../components/ui";
const COL = ["#0B1F3A", "#163A5F", "#3F5F85", "#8A7A5C", "#C9B99A", "#667085", "#B8A98C"];
const short = (v) => (v >= 1e5 ? `₹${+(v / 1e5).toFixed(1)}L` : v >= 1e3 ? `₹${+(v / 1e3).toFixed(1)}k` : `₹${v}`);
const dur = (h) => (h >= 48 ? `${(h / 24).toFixed(1)} days` : `${h} hrs`);
const Empty = ({ text }) => <p className="p-6 text-sm text-muted">{text}</p>;
export default function Reports() {
  const [r, setR] = useState(); const [bad, setBad] = useState(false); useEffect(() => { api.get("/reports").then((x) => setR(x.data)).catch(() => setBad(true)); }, []);
  if (bad) return <p>Couldn't load the reports. Please refresh and try again.</p>; if (!r) return <p>Loading…</p>;
  const catTotal = r.category.reduce((s, x) => s + x.value, 0); const monthsHave = r.monthly.some((m) => m.claimed > 0 || m.paid > 0);
  const csv = () => { const rows = [["Report", "Name", "Claimed (INR)", "Paid (INR)"], ...r.monthly.map((m) => ["Monthly", m.name, m.claimed, m.paid]), ...r.department.map((d) => ["Department", d.name, d.value, ""]), ...r.category.map((c) => ["Category", c.name, c.value, ""])];
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows.map((x) => x.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" })); a.download = "meridian-report.csv"; a.click(); };
  return (<div><div className="flex flex-wrap items-center justify-between gap-3 mb-5"><h1 className="font-display text-2xl text-navy">Reports</h1><button className="btn2 !py-1.5 !text-sm" onClick={csv}>Download CSV</button></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Stat label="Total Travel Spending" value={inr(r.totalTravel)} hint="Approved trips (estimated)" /><Stat label="Total Reimbursed" value={inr(r.totalReimbursed)} hint="Paid claims" />
      <Stat label="Pending Reimbursements" value={inr(r.pendingReimbursements)} hint="Waiting for review or payment" /><Stat label="Avg. Approval Time" value={r.approvalsMeasured ? dur(r.avgApprovalHours) : "—"} hint={r.approvalsMeasured ? `Across ${r.approvalsMeasured} manager decisions` : "No decisions yet"} /></div>
    <p className="text-xs text-muted mb-4">Rejected claims are not included in these figures.</p>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="md:col-span-2"><Section title="Monthly spending (last 6 months)">{monthsHave ? <div className="h-72 p-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={r.monthly}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DFD1" />
        <XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} tickFormatter={short} width={56} /><Tooltip formatter={(v) => inr(v)} /><Legend /><Bar dataKey="claimed" name="Claimed" fill="#163A5F" radius={[3, 3, 0, 0]} /><Bar dataKey="paid" name="Paid" fill="#2F6B4F" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div>
        : <Empty text="No claims yet. This chart fills in as claims are submitted and paid." />}</Section></div>
      <Section title="Department spending">{r.department.length ? <div className="p-4" style={{ height: Math.max(200, r.department.length * 46 + 50) }}><ResponsiveContainer width="100%" height="100%"><BarChart data={r.department} layout="vertical" margin={{ left: 4, right: 12 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8DFD1" /><XAxis type="number" fontSize={12} tickFormatter={short} /><YAxis type="category" dataKey="name" width={96} fontSize={12} /><Tooltip formatter={(v) => inr(v)} /><Bar dataKey="value" name="Spending" fill="#163A5F" radius={[0, 3, 3, 0]} /></BarChart></ResponsiveContainer></div> : <Empty text="No department spending yet." />}</Section>
      <Section title="Expense categories">{r.category.length ? <div className="p-4 flex flex-wrap items-center gap-4"><div className="w-44 h-44 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={r.category} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>
        {r.category.map((_, i) => <Cell key={i} fill={COL[i % COL.length]} />)}</Pie><Tooltip formatter={(v) => inr(v)} /></PieChart></ResponsiveContainer></div>
        <ul className="flex-1 min-w-[190px] text-sm space-y-1.5">{r.category.map((c, i) => <li key={c.name} className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm shrink-0" style={{ background: COL[i % COL.length] }} /><span className="flex-1">{c.name}</span><span className="text-muted">{catTotal ? Math.round((c.value / catTotal) * 100) : 0}%</span><span className="font-medium">{inr(c.value)}</span></li>)}</ul></div> : <Empty text="No expenses yet." />}</Section>
    </div></div>);
}
