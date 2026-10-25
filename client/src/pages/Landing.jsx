import { useEffect, useRef } from "react"; import { useNavigate } from "react-router-dom"; import html from "../landing.html?raw";
// Public home page. It runs in an isolated iframe so its styles never clash with the app; its buttons post a message to navigate.
export default function Landing() {
  const nav = useNavigate(); const ref = useRef();
  useEffect(() => { const h = (e) => { const go = e.data?.meridianGo; if (e.source === ref.current?.contentWindow && typeof go === "string" && go.startsWith("/login")) nav(go); };
    window.addEventListener("message", h); return () => window.removeEventListener("message", h); }, [nav]);
  return <iframe ref={ref} title="Meridian" srcDoc={html} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0 }} />;
}
