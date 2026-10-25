import axios from "axios"; import { mockAdapter } from "./mock";
const mem = {}; // fallback when the browser blocks storage
export const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return mem[k] ?? null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { mem[k] = v; } }, del: (k) => { try { localStorage.removeItem(k); } catch { delete mem[k]; } } };
const api = axios.create({ baseURL: "/api" }); if (import.meta.env.VITE_MOCK) api.defaults.adapter = mockAdapter;
api.interceptors.request.use((c) => { const t = store.get("token"); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
api.interceptors.response.use((r) => r, (e) => { // expired/invalid token: clear it and go to the login screen (AuthContext handles the initial /me check itself)
  if (e.response?.status === 401 && !String(e.config?.url).match(/^\/(me|auth)/)) { store.del("token"); if (import.meta.env.VITE_MOCK) location.hash = "#/login"; else if (!location.pathname.includes("login")) location.href = "/login"; } return Promise.reject(e); });
export const err = (e) => e.response?.data?.message || e.message;
export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
export const fd = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
export const fdt = (d) => (d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—");
export default api;
