import { Router } from "express"; import crypto from "crypto"; import jwt from "jsonwebtoken"; import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
const app = Router();
const env = (k) => () => process.env[k];
const P = {
  google: { auth: "https://accounts.google.com/o/oauth2/v2/auth", token: "https://oauth2.googleapis.com/token", info: "https://openidconnect.googleapis.com/v1/userinfo", id: env("GOOGLE_CLIENT_ID"), secret: env("GOOGLE_CLIENT_SECRET") },
  linkedin: { auth: "https://www.linkedin.com/oauth/v2/authorization", token: "https://www.linkedin.com/oauth/v2/accessToken", info: "https://api.linkedin.com/v2/userinfo", id: env("LINKEDIN_CLIENT_ID"), secret: env("LINKEDIN_CLIENT_SECRET") },
};
const redirectUri = (p) => `${process.env.APP_URL}/api/auth/oauth/${p}/callback`;
const fail = (res, code) => res.redirect(`${process.env.APP_URL}/login?error=${code}`);
const readCookie = (req, name) => (req.headers.cookie || "").split(/;\s*/).map((c) => c.split("=")).find(([k]) => k === name)?.[1];
const COOKIE = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/api/auth/oauth" };

// Step 1: send the browser to the provider with a random state value (CSRF protection)
app.get("/api/auth/oauth/:provider", (req, res) => {
  const p = P[req.params.provider]; if (!p || !p.id() || !p.secret()) return fail(res, "oauth_not_configured");
  const state = crypto.randomBytes(16).toString("hex"); res.cookie("oauth_state", state, { ...COOKIE, maxAge: 10 * 60 * 1000 });
  res.redirect(`${p.auth}?${new URLSearchParams({ client_id: p.id(), redirect_uri: redirectUri(req.params.provider), response_type: "code", scope: "openid profile email", state })}`);
});

// Step 2: provider redirects back here with a code
app.get("/api/auth/oauth/:provider/callback", async (req, res) => {
  const name = req.params.provider, p = P[name]; if (!p) return fail(res, "oauth_failed");
  try {
    const { code, state, error } = req.query; const saved = readCookie(req, "oauth_state"); res.clearCookie("oauth_state", COOKIE);
    if (error) return fail(res, "oauth_denied");
    if (!saved || typeof state !== "string" || saved.length !== state.length || !crypto.timingSafeEqual(Buffer.from(saved), Buffer.from(state))) return fail(res, "oauth_state");
    const t = await (await fetch(p.token, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri(name), client_id: p.id(), client_secret: p.secret() }) })).json();
    if (!t.access_token) return fail(res, "oauth_failed");
    const info = await (await fetch(p.info, { headers: { Authorization: `Bearer ${t.access_token}` } })).json();
    const email = info.email?.toLowerCase(); if (!email || !info.sub || !(info.email_verified === true || info.email_verified === "true")) return fail(res, "oauth_email");
    let u = await User.findOne({ email });
    if (!u) { // First sign-in: create an employee account (on by default). Optionally limit to one email domain.
      const domain = (process.env.OAUTH_ALLOWED_DOMAIN || "").toLowerCase();
      if (process.env.OAUTH_AUTO_CREATE === "false" || (domain && !email.endsWith("@" + domain))) return fail(res, "oauth_no_account");
      u = new User({ name: info.name || email.split("@")[0], email, role: "employee", department: "Unassigned", password: await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10) });
    }
    if (!u.isActive) return fail(res, "oauth_inactive");
    const linked = u.authProviders.find((a) => a.provider === name);
    if (linked && linked.providerId !== info.sub) return fail(res, "oauth_mismatch"); // same email, different provider identity
    if (!linked) u.authProviders.push({ provider: name, providerId: info.sub });
    if (info.picture) u.avatarUrl = info.picture; u.lastLogin = new Date(); await u.save();
    const token = jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.redirect(`${process.env.APP_URL}/oauth/callback#token=${token}`); // fragment is never sent to servers or logged
  } catch (e) { console.error("OAuth error:", e.message); fail(res, "oauth_failed"); }
});
// Lets the login page show which providers are configured on this server
app.get("/api/auth/providers", (req, res) => res.json({ google: !!(P.google.id() && P.google.secret()), linkedin: !!(P.linkedin.id() && P.linkedin.secret()) }));
export default app;
