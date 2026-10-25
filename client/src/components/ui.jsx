import { Link } from "react-router-dom";
export const Logo = ({ light, sub }) => (<div className="flex items-center gap-3">
  <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="17" stroke={light ? "#E8DFD1" : "#0B1F3A"} strokeWidth="2"/><path d="M20 6l5 14-5 14-5-14z" fill={light ? "#E8DFD1" : "#0B1F3A"}/><path d="M20 6v28" stroke={light ? "#0B1F3A" : "#F4EFE6"} strokeWidth="1.5"/></svg>
  <div><div className={`font-display text-xl tracking-wide ${light ? "text-beige" : "text-navy"}`}>MERIDIAN</div>{sub && <div className={`text-xs ${light ? "text-beige2" : "text-muted"}`}>Corporate Travel &amp; Reimbursement</div>}</div></div>);
const tone = (s = "") => /Approved|Paid|Completed|Verified|Submitted$/.test(s) && !/Pending|Review/.test(s) ? "bg-emerald-50 text-emerald-800 border-emerald-200"
  : /Reject/.test(s) ? "bg-red-50 text-red-800 border-red-200" : /Pending|Review|Returned|Changes|Proof|Needs/.test(s) ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-beige2 text-ink border-beige2";
export const Badge = ({ s }) => <span className={`inline-block border rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${tone(s)}`}>{s}</span>;
export const Stat = ({ label, value }) => <div className="card p-5"><div className="text-sm text-muted">{label}</div><div className="font-display text-3xl text-navy mt-1">{value}</div></div>;
export const Empty = ({ text, to, cta }) => <div className="p-10 text-center text-muted"><div className="mx-auto mb-3 opacity-60 flex justify-center"><Logo /></div><p>{text}</p>{to && <Link to={to} className="btn inline-block mt-4">{cta}</Link>}</div>;
export const Table = ({ cols, rows, empty }) => rows.length ? (<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-muted border-b border-beige2">{cols.map((c) => <th key={c} className="py-3 px-4 font-medium">{c}</th>)}</tr></thead>
  <tbody>{rows.map((r, i) => <tr key={i} className="border-b border-beige2/60 hover:bg-beige/50">{r.map((c, j) => <td key={j} className="py-3 px-4">{c}</td>)}</tr>)}</tbody></table></div>) : empty;
export const Section = ({ title, action, children }) => <div className="card mb-6"><div className="flex flex-wrap gap-3 justify-between items-center px-4 pt-4"><h2 className="font-display text-lg text-navy">{title}</h2>{action}</div>{children}</div>;
