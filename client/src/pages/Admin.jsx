import { useEffect, useState } from "react"; import api, { err } from "../services/api"; import { Section, Table } from "../components/ui";
export default function Admin({ tab }) {
  const [users, setUsers] = useState([]); const [pol, setPol] = useState([]); const [nu, setNu] = useState({ name: "", email: "", role: "employee", department: "", managerId: "", password: "demo123" }); const [e, setE] = useState("");
  const load = () => { api.get("/users").then((r) => setUsers(r.data)); api.get("/policies").then((r) => setPol(r.data)); }; useEffect(load, []);
  const add = async () => { setE(""); try { await api.post("/users", nu); setNu({ ...nu, name: "", email: "" }); load(); } catch (x) { setE(err(x)); } };
  const upd = async (u, b) => { await api.put("/users/" + u._id, b); load(); }; const mgrs = users.filter((u) => u.role === "manager");
  if (tab === "policies") return (<Section title="Expense policies and proof rules"><p className="px-4 pt-2 text-sm text-muted">Required documents are the files an employee must attach for that category. Items above the “extra proof” amount also need a Supporting document. A no-receipt declaration is allowed only up to its limit (0 turns it off).</p>
    <Table cols={["Category", "Max (₹)", "Receipt required", "Pre-approval", "Required documents (comma separated)", "Extra proof above (₹)", "No-receipt up to (₹)", ""]} rows={pol.map((p) => {
    const set = (k, v) => setPol(pol.map((x) => (x._id === p._id ? { ...x, [k]: v } : x))); const docsText = p.docsText ?? (p.requiredDocs || []).join(", ");
    const save = () => api.put("/policies/" + p._id, { ...p, requiredDocs: docsText.split(",").map((z) => z.trim()).filter(Boolean), docsText: undefined }).then(load);
    return [p.category, <input type="number" className="inp !w-24" value={p.maxAmount} onChange={(x) => set("maxAmount", +x.target.value)} />, <input type="checkbox" aria-label="Receipt required" checked={p.receiptRequired} onChange={(x) => set("receiptRequired", x.target.checked)} />,
      <input type="checkbox" aria-label="Pre-approval required" checked={p.requiresPreApproval} onChange={(x) => set("requiresPreApproval", x.target.checked)} />, <input className="inp !w-56" value={docsText} onChange={(x) => set("docsText", x.target.value)} />,
      <input type="number" min="0" className="inp !w-24" value={p.extraProofAbove ?? 0} onChange={(x) => set("extraProofAbove", +x.target.value)} />, <input type="number" min="0" className="inp !w-24" value={p.noReceiptLimit ?? 0} onChange={(x) => set("noReceiptLimit", +x.target.value)} />, <button className="btn !py-1" onClick={save}>Save</button>]; })} /></Section>);
  return (<div><Section title="Add user"><div className="p-4 grid sm:grid-cols-3 gap-3">
    {["name", "email", "department"].map((k) => <input key={k} className="inp" placeholder={k} value={nu[k]} onChange={(x) => setNu({ ...nu, [k]: x.target.value })} />)}
    <select className="inp" value={nu.role} onChange={(x) => setNu({ ...nu, role: x.target.value })}>{["employee", "manager", "finance", "admin"].map((r) => <option key={r}>{r}</option>)}</select>
    <select className="inp" value={nu.managerId} onChange={(x) => setNu({ ...nu, managerId: x.target.value })}><option value="">No manager</option>{mgrs.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}</select>
    <button className="btn" onClick={add}>Create user</button>{e && <p className="text-red-800 text-sm sm:col-span-3">{e}</p>}</div></Section>
    <Section title="Users"><Table cols={["Name", "Email", "Role", "Department", "Manager", "Active"]} rows={users.map((u) => [u.name, u.email,
      <select className="inp !w-32" value={u.role} onChange={(x) => upd(u, { role: x.target.value })}>{["employee", "manager", "finance", "admin"].map((r) => <option key={r}>{r}</option>)}</select>, u.department, <select className="inp !w-40" value={u.managerId?._id || ""} onChange={(x) => upd(u, { managerId: x.target.value })}><option value="">Unassigned</option>{mgrs.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}</select>,
      <button className="underline text-navy2" onClick={() => upd(u, { isActive: !u.isActive })}>{u.isActive ? "Deactivate" : "Activate"}</button>])} /></Section></div>);
}
