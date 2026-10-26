import { Router } from "express"; import jwt from "jsonwebtoken"; import bcrypt from "bcryptjs";
import { User, TravelRequest as TR, ExpenseClaim as EC, Policy, Notification } from "../models/index.js";
import { auth } from "../middleware/auth.js"; import { role } from "../middleware/role.js"; import { upload, storeReceipt } from "../middleware/upload.js";
import { wrap, code, inr, scope, total } from "../utils/helpers.js"; import { notify, notifyRole } from "../utils/notificationService.js"; import { checkPolicy } from "../utils/policyChecker.js";
const app = Router();
app.post("/api/auth/login", wrap(async (req, res) => {
  if (typeof req.body.email !== "string" || typeof req.body.password !== "string" || !req.body.email.trim() || !req.body.password) return res.status(400).json({ message: "Please enter your email and password" });
  const u = await User.findOne({ email: req.body.email.trim().toLowerCase() });
  if (!u || !u.isActive || !(await bcrypt.compare(req.body.password || "", u.password))) return res.status(401).json({ message: "Invalid email or password" });
  u.lastLogin = new Date(); await u.save(); const token = jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, user: { id: u._id, name: u.name, email: u.email, role: u.role, department: u.department, avatarUrl: u.avatarUrl } }); }));
app.get("/api/me", auth, (req, res) => res.json({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, department: req.user.department, avatarUrl: req.user.avatarUrl }));
// Testing mode: lets sign-up pick a role. ON by default while developing; OFF when NODE_ENV=production or SIGNUP_ROLE_CHOICE=false.
const roleChoiceOn = () => process.env.SIGNUP_ROLE_CHOICE !== "false" && process.env.NODE_ENV !== "production";
app.get("/api/auth/config", (req, res) => res.json({ signup: process.env.ALLOW_SIGNUP !== "false", roleChoice: roleChoiceOn(), demoAccounts: process.env.SEED_DEMO_USERS === "true" }));
// Self sign-up with email + password. The role is "employee" unless testing mode (SIGNUP_ROLE_CHOICE) is on.
const signups = new Map(); // simple per-address limiter: 20 sign-ups per hour
app.post("/api/auth/register", wrap(async (req, res) => {
  if (process.env.ALLOW_SIGNUP === "false") throw new Error("Sign-up is turned off. Ask your admin to create your account.");
  const now = Date.now(), recent = (signups.get(req.ip) || []).filter((t) => now - t < 36e5);
  if (recent.length >= 20) return res.status(429).json({ message: "Too many sign-ups from this address. Please try again later." }); signups.set(req.ip, [...recent, now]);
  const name = String(req.body.name || "").trim().slice(0, 80), email = String(req.body.email || "").trim().toLowerCase().slice(0, 120), password = String(req.body.password || "");
  if (name.length < 2) throw new Error("Please enter your full name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address");
  if (password.length < 8) throw new Error("Password must be at least 8 characters");
  const domain = (process.env.ALLOWED_EMAIL_DOMAIN || "").toLowerCase(); if (domain && !email.endsWith("@" + domain)) throw new Error(`Sign-up is limited to @${domain} email addresses`);
  if (await User.findOne({ email })) return res.status(409).json({ message: "An account with this email already exists. Try signing in." });
  const role = roleChoiceOn() && ["employee", "manager", "finance", "admin"].includes(req.body.role) ? req.body.role : "employee";
  const mgr = role === "employee" ? await User.findOne({ role: "manager", isActive: true }).sort("createdAt") : null; // give new employees a default manager so travel approvals work (admin can change it)
  let u; try { u = await User.create({ name, email, password: await bcrypt.hash(password, 10), role, managerId: mgr?._id, department: "Unassigned", isActive: true, lastLogin: new Date() }); }
  catch (e) { if (e.code === 11000) return res.status(409).json({ message: "An account with this email already exists. Try signing in." }); throw e; }
  const token = jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
  res.status(201).json({ token, user: { id: u._id, name: u.name, email: u.email, role: u.role, department: u.department } }); }));
export default app;
