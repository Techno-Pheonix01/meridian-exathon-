import { useEffect, useState } from "react"; import api, { fdt } from "../services/api"; import { Section, Empty } from "../components/ui";
export default function Notifications() {
  const [n, setN] = useState([]); useEffect(() => { api.get("/notifications").then((r) => setN(r.data)); }, []);
  const read = async () => { await api.post("/notifications/read"); setN(n.map((x) => ({ ...x, read: true }))); };
  return (<Section title="Notifications" action={<button className="btn2" onClick={read}>Mark all as read</button>}>
    {n.length ? n.map((x) => <div key={x._id} className={`px-4 py-3 border-b border-beige2 ${x.read ? "" : "bg-beige/60"}`}><div className="text-sm font-medium">{x.title}</div><div className="text-sm text-muted">{x.message}</div><div className="text-xs text-muted mt-1">{fdt(x.createdAt)}</div></div>) : <Empty text="You're all caught up." />}</Section>);
}
