import React from "react"; import { createRoot } from "react-dom/client"; import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App.jsx"; import { AuthProvider } from "./context/AuthContext.jsx"; import "./index.css";
const R = import.meta.env.VITE_MOCK ? HashRouter : BrowserRouter;
createRoot(document.getElementById("root")).render(<R><AuthProvider><App /></AuthProvider></R>);
