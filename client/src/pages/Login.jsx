import { useEffect, useState } from "react"; import { useNavigate, Navigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; import { Logo } from "../components/ui"; import api, { err } from "../services/api";
const ROLE_CARDS = [["employee", "Employee", "Request trips and claim expenses"], ["manager", "Manager", "Approve team trips and claims"], ["finance", "Finance", "Review claims and pay reimbursements"], ["admin", "Admin", "Manage users, policies and reports"]];
const demos = [["Employee", "employee@company.com"], ["Manager", "manager@company.com"], ["Finance", "finance@company.com"], ["Admin", "admin@company.com"]];
const field = "w-full rounded-xl border border-navy2 bg-navy2/20 px-4 py-3 text-beige placeholder:text-beige2/55 focus:outline-2 focus:outline-beige2";

export default function Login() {
  const { login, user, setSession } = useAuth(); const nav = useNavigate(); const [q] = useSearchParams(); const signup = q.get("mode") === "signup"; const mock = !!import.meta.env.VITE_MOCK;
  const [f, setF] = useState({ email: "", password: "" }); const [show, setShow] = useState(false); const [e, setE] = useState(""); const [busy, setBusy] = useState(false); const [reg, setReg] = useState({ name: "", email: "", password: "", confirm: "", role: "employee" }); const [roleChoice, setRoleChoice] = useState(mock); const [cfgNote, setCfgNote] = useState(""); const [demoOn, setDemoOn] = useState(mock);
  useEffect(() => { if (!mock) { api.get("/auth/config").then((r) => { setDemoOn(!!r.data.demoAccounts); setRoleChoice(!!r.data.roleChoice); if (!r.data.roleChoice) setCfgNote("off"); }).catch(() => setCfgNote("old")); } }, []);
  useEffect(() => { setE(""); }, [signup]); // clear a leftover login error when switching between Sign In and Sign Up
  if (user) return <Navigate to="/dashboard" />;
  const go = async (ev) => { ev.preventDefault(); setBusy(true); setE(""); try { await login(f.email, f.password); nav("/dashboard"); } catch (x) { setE(err(x)); } setBusy(false); };
  const register = async (ev) => { ev.preventDefault(); setE(""); if (reg.password !== reg.confirm) return setE("The two passwords don't match."); setBusy(true);
    try { const { data } = await api.post("/auth/register", { name: reg.name, email: reg.email, password: reg.password, ...(roleChoice ? { role: reg.role } : {}) }); await setSession(data.token); nav("/dashboard"); } catch (x) { setE(err(x)); } setBusy(false); };

  return (<div className="min-h-screen bg-[#07111F] relative overflow-hidden flex items-center justify-center p-4">
    <svg className="absolute -right-40 -bottom-40 opacity-[.07] pointer-events-none" width="640" height="640" viewBox="0 0 100 100" fill="none" stroke="#F4EFE6" aria-hidden="true"><circle cx="50" cy="50" r="46" strokeWidth=".3"/><circle cx="50" cy="50" r="34" strokeWidth=".3"/><path d="M50 4v92M4 50h92" strokeWidth=".2"/><path d="M50 12l8 38-8 38-8-38z" fill="#F4EFE6" stroke="none"/></svg>
    <div className="relative w-full max-w-[460px] rounded-3xl border border-navy2 bg-navy p-8 shadow-2xl text-beige">
      <Link to="/" aria-label="Close and return home" className="absolute right-5 top-5 text-beige2/70 hover:text-white"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></Link>
      <div className="flex justify-center mb-7 mt-2"><Logo light sub /></div>
      {e && <div role="alert" className="mb-4 text-sm text-red-200 bg-red-900/30 border border-red-400/30 rounded-xl p-3">{e}</div>}

      {signup ? (<div>
        <h1 className="text-center font-display text-2xl mb-1">Create your account</h1>
        <p className="text-center text-sm text-beige2/70 mb-5">Sign up with your email and a password.</p>
        <form onSubmit={register} className="space-y-3">
          {roleChoice && <fieldset><legend className="text-xs text-beige2/70 mb-2">Which kind of account are you creating?</legend>
            <div className="grid grid-cols-2 gap-2">{ROLE_CARDS.map(([r, title, desc]) => <label key={r} className={`cursor-pointer rounded-xl border p-3 transition ${reg.role === r ? "border-beige bg-navy2/60 ring-1 ring-beige" : "border-navy2 hover:bg-navy2/30"}`}>
              <input type="radio" name="role" value={r} className="sr-only" checked={reg.role === r} onChange={() => setReg({ ...reg, role: r })} />
              <div className="text-sm font-medium flex items-center justify-between">{title}{reg.role === r && <span aria-hidden="true">✓</span>}</div><div className="text-[11px] text-beige2/70 leading-snug">{desc}</div></label>)}</div></fieldset>}
          <input className={field} required placeholder="Full name" aria-label="Full name" autoComplete="name" value={reg.name} onChange={(x) => setReg({ ...reg, name: x.target.value })} />
          <input className={field} type="email" required placeholder="Email" aria-label="Email" autoComplete="email" value={reg.email} onChange={(x) => setReg({ ...reg, email: x.target.value })} />
          <input className={field} type={show ? "text" : "password"} required minLength={8} placeholder="Password (at least 8 characters)" aria-label="Password" autoComplete="new-password" value={reg.password} onChange={(x) => setReg({ ...reg, password: x.target.value })} />
          <input className={field} type={show ? "text" : "password"} required minLength={8} placeholder="Confirm password" aria-label="Confirm password" autoComplete="new-password" value={reg.confirm} onChange={(x) => setReg({ ...reg, confirm: x.target.value })} />
          {roleChoice && <p className="text-[11px] text-amber-200/80">Testing mode: you can pick any role. Switch this off before real use.</p>}
          {!roleChoice && cfgNote && import.meta.env.DEV && <p className="text-[11px] text-amber-200/80">{cfgNote === "old" ? "Role choice is hidden because your server is out of date. Replace server/controllers/authController.js and restart the server." : "Role choice is off on this server (SIGNUP_ROLE_CHOICE=false or production mode). New sign-ups are employees."}</p>}
          <label className="flex items-center gap-2 text-xs text-beige2/70"><input type="checkbox" checked={show} onChange={(x) => setShow(x.target.checked)} /> Show passwords</label>
          <button disabled={busy} className="w-full rounded-xl bg-beige text-navy font-medium py-3 hover:bg-white disabled:opacity-70">{busy ? "Creating account…" : roleChoice ? `Create ${reg.role} account` : "Create account"}</button></form>
        <p className="text-center text-sm mt-6 text-beige2/80">Already have an account? <Link to="/login" className="text-white underline">Sign In</Link></p>
      </div>) : (<form onSubmit={go}>
        <input className={field + " mb-4"} type="email" required placeholder="Username or E-mail" aria-label="Username or E-mail" autoComplete="username" value={f.email} onChange={(x) => setF({ ...f, email: x.target.value })} />
        <div className="relative mb-5"><input className={field + " pr-16"} type={show ? "text" : "password"} required placeholder="Password" aria-label="Password" autoComplete="current-password" value={f.password} onChange={(x) => setF({ ...f, password: x.target.value })} />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-3.5 text-xs text-beige2/70 hover:text-white">{show ? "Hide" : "Show"}</button></div>
        <button disabled={busy} className="w-full rounded-xl bg-beige text-navy font-medium py-3 hover:bg-white disabled:opacity-70">{busy ? "Signing in…" : "Sign In"}</button>
        <p className="text-center text-sm text-beige2/70 mt-6">By continuing, you agree to our <span className="text-sky-300">Terms</span> &amp; <span className="text-sky-300">Privacy Policy</span>.</p>
        <div className="flex justify-between text-sm mt-6"><button type="button" onClick={() => alert("Contact your admin to reset your password.")} className="hover:underline">Forgot Password?</button><Link to="/login?mode=signup" className="hover:underline">Sign Up</Link></div>
        {demoOn && <div className="mt-7 pt-5 border-t border-navy2"><div className="text-xs text-beige2/60 mb-2 text-center">Demo accounts · password demo123</div><div className="grid grid-cols-4 gap-2">
          {demos.map(([r, em]) => <button type="button" key={r} className="rounded-lg border border-navy2 py-1.5 text-xs hover:bg-navy2/40" onClick={() => setF({ email: em, password: "demo123" })}>{r}</button>)}</div></div>}
      </form>)}
    </div></div>);
}
