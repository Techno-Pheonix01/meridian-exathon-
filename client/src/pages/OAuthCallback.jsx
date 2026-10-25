import { useEffect, useRef } from "react"; import { useNavigate } from "react-router-dom"; import { useAuth } from "../context/AuthContext";
export default function OAuthCallback() {
  const { setSession } = useAuth(); const nav = useNavigate(); const ran = useRef(false);
  useEffect(() => { if (ran.current) return; ran.current = true; const token = new URLSearchParams(location.hash.slice(1)).get("token");
    history.replaceState(null, "", location.pathname); // remove the token from the address bar
    if (!token) return nav("/login?error=oauth_failed", { replace: true });
    setSession(token).then(() => nav("/dashboard", { replace: true })).catch(() => nav("/login?error=oauth_failed", { replace: true })); }, []);
  return <div className="p-10">Signing you in…</div>;
}
