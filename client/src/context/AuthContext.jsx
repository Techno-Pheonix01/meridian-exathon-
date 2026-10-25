import { createContext, useContext, useEffect, useState } from "react"; import api, { store } from "../services/api";
const Ctx = createContext(); export const useAuth = () => useContext(Ctx);
export const home = { employee: "/dashboard", manager: "/dashboard", finance: "/dashboard", admin: "/dashboard" };
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(!!store.get("token"));
  useEffect(() => { if (loading) api.get("/me").then((r) => setUser(r.data)).catch(() => store.del("token")).finally(() => setLoading(false)); }, []);
  const login = async (email, password) => { const { data } = await api.post("/auth/login", { email, password }); store.set("token", data.token); setUser(data.user); return data.user; };
  const setSession = async (token) => { store.set("token", token); const { data } = await api.get("/me"); setUser(data); return data; };
  const logout = () => { store.del("token"); setUser(null); };
  return <Ctx.Provider value={{ user, loading, login, logout, setSession }}>{children}</Ctx.Provider>;
}
