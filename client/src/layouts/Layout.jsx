import { NavLink, useNavigate, useLocation } from "react-router-dom"; import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; import { Logo } from "../components/ui"; import api from "../services/api";
const NAV = {
  employee: [["Dashboard", "/dashboard"], ["My Travel", "/travel"], ["Expenses", "/claims"], ["Reimbursements", "/claims?paid=1"], ["Notifications", "/notifications"]],
  manager: [["Dashboard", "/dashboard"], ["Travel Approvals", "/travel"], ["Expense Approvals", "/claims"], ["Reports", "/reports"], ["Notifications", "/notifications"]],
  finance: [["Dashboard", "/dashboard"], ["Expense Review", "/claims"], ["Reimbursements", "/claims?paid=1"], ["Reports", "/reports"], ["Notifications", "/notifications"]],
  admin: [["Dashboard", "/dashboard"], ["Users", "/users"], ["Travel Requests", "/travel"], ["Expense Claims", "/claims"], ["Policies", "/policies"], ["Reports", "/reports"]] };
export default function Layout({ children }) {
  const { user, logout } = useAuth(); const nav = useNavigate(); const loc = useLocation(); const [unread, setUnread] = useState(0); const [menu, setMenu] = useState(false); const [drawer, setDrawer] = useState(false); useEffect(() => setDrawer(false), [loc.pathname, loc.search]);
  useEffect(() => { api.get("/notifications").then((r) => setUnread(r.data.filter((n) => !n.read).length)).catch(() => {}); }, [loc.pathname]);
  return (<div className="flex min-h-screen">
    <aside className="w-60 bg-navy text-beige2 p-5 hidden md:flex flex-col gap-1 shrink-0"><div className="mb-8"><Logo light sub /></div>
      {NAV[user.role].map(([l, p]) => <NavLink key={l} to={p} end className={({ isActive }) => `px-3 py-2 rounded-md text-sm ${isActive && !p.includes("?") ? "bg-navy2 text-white" : "hover:bg-navy2/60"}`}>{l}</NavLink>)}
      <button onClick={() => { logout(); nav("/"); }} className="mt-auto px-3 py-2 rounded-md text-sm text-left border border-navy2 hover:bg-navy2/60 flex items-center gap-2"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>Log out</button></aside>
    <div className="flex-1 min-w-0"><header className="bg-paper border-b border-beige2 px-4 sm:px-6 py-3 flex items-center justify-end gap-3 sm:gap-5">
      <button onClick={() => setDrawer(true)} aria-label="Open menu" className="md:hidden mr-auto text-navy"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
      <button onClick={() => nav("/notifications")} className="relative text-navy" aria-label="Notifications"><svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M6 9a6 6 0 1112 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 004 0"/></svg>
        {unread > 0 && <span className="absolute -top-1.5 -right-2 bg-navy text-white text-[10px] rounded-full px-1.5">{unread}</span>}</button>
      <button onClick={() => { logout(); nav("/"); }} className="btn2 !py-1.5 !text-xs">Log out</button>
      <div className="relative"><button onClick={() => setMenu(!menu)} className="flex items-center gap-3 text-left">{user.avatarUrl ? <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-navy text-beige flex items-center justify-center text-sm">{user.name[0]}</div>}
        <div><div className="text-sm font-medium leading-tight">{user.name}</div><div className="text-xs text-muted capitalize">{user.role}</div></div></button>
        {menu && <div className="absolute right-0 mt-2 w-40 card shadow-md z-10"><div className="px-4 py-2 text-xs text-muted">{user.email}</div><button onClick={() => { logout(); nav("/"); }} className="w-full text-left px-4 py-2 text-sm hover:bg-beige">Log out</button></div>}</div></header>
      <main className="p-4 sm:p-6 max-w-6xl">{children}</main></div>
    {drawer && <div className="fixed inset-0 z-30 md:hidden flex"><div className="w-64 bg-navy text-beige2 p-5 flex flex-col gap-1 overflow-y-auto"><div className="mb-6 flex items-center justify-between"><Logo light /><button onClick={() => setDrawer(false)} aria-label="Close menu" className="text-beige2 text-xl">✕</button></div>
      {NAV[user.role].map(([l, p]) => <NavLink key={l} to={p} end className="px-3 py-2 rounded-md text-sm hover:bg-navy2/60">{l}</NavLink>)}
      <button onClick={() => { logout(); nav("/"); }} className="mt-auto px-3 py-2 rounded-md text-sm text-left border border-navy2">Log out</button></div>
      <div className="flex-1 bg-black/50" onClick={() => setDrawer(false)} /></div>}</div>);
}
