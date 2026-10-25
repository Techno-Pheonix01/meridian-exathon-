
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

// Production uses Render; local development uses Vite's proxy.
const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
});

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
