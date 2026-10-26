
import axios from "axios";
import { mockAdapter } from "./mock";

const mem = {}; // Fallback when browser storage is unavailable

export const store = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return mem[k] ?? null;
    }
  },

  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      mem[k] = v;
    }
  },

  del: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      delete mem[k];
    }
  },
};

// Backend address (no trailing slash, no "/api" - we add that below).
// - On Vercel: set VITE_API_URL to your Render URL. If it is missing, the Render URL below is used.
// - On your own computer: leave it empty; Vite's proxy (vite.config.js) forwards /api to localhost:5000.
const DEFAULT_PROD_API = "https://meridian-5g9v.onrender.com";
export const API_ORIGIN = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? DEFAULT_PROD_API : ""))
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

// Every backend route starts with /api (for example POST /api/auth/register).
const api = axios.create({
  baseURL: API_ORIGIN + "/api",
});

// Receipts are saved by the backend as "/uploads/..." (or a full Cloudinary link).
// Turn the "/uploads/..." form into a full link that points at the backend, not at Vercel.
export const fileUrl = (u) => (u && u.startsWith("/uploads/") ? API_ORIGIN + u : u);

if (import.meta.env.VITE_MOCK) {
  api.defaults.adapter = mockAdapter;
}

api.interceptors.request.use((config) => {
  const token = store.get("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !String(error.config?.url).match(/^\/(me|auth)/)
    ) {
      store.del("token");

      if (import.meta.env.VITE_MOCK) {
        window.location.hash = "#/login";
      } else if (!window.location.pathname.includes("login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const err = (error) =>
  error.response?.data?.message || error.message;

export const inr = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN");

export const fd = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export const fdt = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

export default api;
