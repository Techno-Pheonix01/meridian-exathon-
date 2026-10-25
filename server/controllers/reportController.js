import { Router } from "express"; import jwt from "jsonwebtoken"; import bcrypt from "bcryptjs";
import { User, TravelRequest as TR, ExpenseClaim as EC, Policy, Notification } from "../models/index.js";
import { auth } from "../middleware/auth.js"; import { role } from "../middleware/role.js"; import { upload, storeReceipt } from "../middleware/upload.js";
import { wrap, code, inr, scope, total } from "../utils/helpers.js"; import { notify, notifyRole } from "../utils/notificationService.js"; import { checkPolicy } from "../utils/policyChecker.js";
const app = Router();
app.get("/api/reports", auth, role("finance", "admin", "manager"), wrap(async (req, res) => { const q = await scope(req.user);
  const claims = await EC.find(q).populate("employeeId", "department"); const trips = await TR.find({ ...q, status: { $ne: "Draft" } });
  const sum = (a, f) => a.reduce((s, x) => s + f(x), 0), group = (a, k, v) => Object.entries(a.reduce((m, x) => ((m[k(x)] = (m[k(x)] || 0) + v(x)), m), {})).map(([name, value]) => ({ name, value }));
  const paid = claims.filter((c) => c.status === "Paid"), pending = claims.filter((c) => !["Paid", "Rejected"].includes(c.status));
  const turn = trips.map((t) => [t.createdAt, t.approvals.find((a) => a.role === "manager")?.timestamp]).filter((x) => x[1]).map(([a, b]) => (b - a) / 36e5);
  res.json({ totalTravel: sum(trips, (t) => t.estimatedCost), totalReimbursed: sum(paid, (c) => c.totalAmount), pendingReimbursements: sum(pending, (c) => c.totalAmount),
    monthly: group(claims, (c) => c.createdAt.toISOString().slice(0, 7), (c) => c.totalAmount), department: group(claims, (c) => c.employeeId?.department || "NA", (c) => c.totalAmount),
    category: group(claims.flatMap((c) => c.expenses), (e) => e.category, (e) => e.amount), avgApprovalHours: turn.length ? +(sum(turn, (x) => x) / turn.length).toFixed(1) : 0 }); }));
export default app;
