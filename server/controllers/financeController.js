import { Router } from "express"; import jwt from "jsonwebtoken"; import bcrypt from "bcryptjs";
import { User, TravelRequest as TR, ExpenseClaim as EC, Policy, Notification } from "../models/index.js";
import { auth } from "../middleware/auth.js"; import { role } from "../middleware/role.js"; import { upload, storeReceipt } from "../middleware/upload.js";
import { wrap, code, inr, scope, total } from "../utils/helpers.js"; import { notify, notifyRole } from "../utils/notificationService.js"; import { checkPolicy } from "../utils/policyChecker.js";
const app = Router();
const decide = (from, next, roleName, notifyFn) => wrap(async (req, res) => { const { action, comment } = req.body; if (!["approve", "reject"].includes(action)) throw new Error("Invalid action");
  if (action === "reject" && !comment?.trim()) throw new Error("A rejection reason is required"); const c = await EC.findById(req.params.id).populate("employeeId");
  if (c.status !== from) throw new Error("Claim is not awaiting this review");
  if (roleName === "manager" && String(c.employeeId.managerId) !== String(req.user._id)) throw new Error("Not your team member");
  if (action === "approve") { const vs = c.expenses.map((x) => x.verification?.status || "Pending"); if (vs.includes("Pending")) throw new Error("Verify or reject every expense item before approving");
    if (vs.includes("Needs Proof")) throw new Error("Some items need more proof. Send the claim back to the employee first.");
    const ok = c.expenses.filter((x) => x.verification?.status === "Verified"); if (!ok.length) throw new Error("Every item was rejected. Reject the claim instead."); c.approvedAmount = ok.reduce((t, x) => t + x.amount, 0); }
  c.status = action === "approve" ? next : "Rejected"; c.approvals.push({ approverId: req.user._id, name: req.user.name, role: roleName, action: action === "approve" ? "Approved" : "Rejected", comment }); await c.save();
  await notify(c.employeeId._id, `Expense claim ${action === "approve" ? "progressed" : "rejected"}`, `Your expense claim ${c.code} is now: ${c.status}.${comment ? " " + comment : ""}`);
  if (roleName === "manager" && action === "approve") await notifyRole("finance", "Claim awaiting finance review", `${c.code} (${inr(c.totalAmount)}) is ready for review.`); res.json(c); });
app.post("/api/claims/:id/manager", auth, role("manager"), decide("Under Manager Review", "Under Finance Review", "manager"));
app.post("/api/claims/:id/finance", auth, role("finance"), decide("Under Finance Review", "Approved for Payment", "finance"));
app.post("/api/claims/:id/pay", auth, role("finance"), wrap(async (req, res) => { const c = await EC.findById(req.params.id); if (c.status !== "Approved for Payment") throw new Error("Claim is not approved for payment");
  const { date, reference } = req.body; const amount = c.approvedAmount ?? c.totalAmount; if (!date || !reference) throw new Error("Payment date and reference are required"); // amount is always the verified total
  c.payment = { amount, date, reference, financeUserId: req.user._id }; c.status = "Paid"; c.approvals.push({ approverId: req.user._id, name: req.user.name, role: "finance", action: "Paid", comment: reference }); await c.save();
  await notify(c.employeeId, "Reimbursement paid", `Your reimbursement of ${inr(amount)} has been paid.`, "success"); res.json(c); }));
const SERIOUS = ["Duplicate Bill", "Receipt Already Used", "Possible Duplicate", "Missing Receipt Declared"];
// Reviewer marks one bill Verified or Rejected (manager at manager stage, finance at finance stage)
app.post("/api/claims/:id/verify", auth, role("manager", "finance"), wrap(async (req, res) => { const { itemId, status, note } = req.body; if (!["Verified", "Rejected", "Needs Proof"].includes(status)) throw new Error("Invalid status");
  const c = await EC.findById(req.params.id).populate("employeeId"); const stage = req.user.role === "manager" ? "Under Manager Review" : "Under Finance Review"; if (c.status !== stage) throw new Error("This claim is not awaiting your review");
  if (req.user.role === "manager" && String(c.employeeId.managerId) !== String(req.user._id)) throw new Error("Not your team member");
  const x = c.expenses.id(itemId); if (!x) throw new Error("Expense item not found"); if (["Rejected", "Needs Proof"].includes(status) && !note?.trim()) throw new Error("A note is required to reject a bill or ask for more proof");
  if (status === "Verified") { if (/Receipt Required/.test(x.policyFlag || "")) throw new Error("A receipt is required for this item. Reject it instead.");
    if (SERIOUS.some((f) => x.policyFlag?.includes(f)) && !note?.trim()) throw new Error("Add a note explaining why this flagged bill is acceptable"); }
  x.verification = { status, by: req.user._id, byName: req.user.name, role: req.user.role, at: new Date(), note: note?.trim() || "" }; await c.save(); res.json(c); }));
// Sends the claim back to the employee when at least one item is marked "Needs Proof"
app.post("/api/claims/:id/return-for-proof", auth, role("manager", "finance"), wrap(async (req, res) => { const c = await EC.findById(req.params.id).populate("employeeId");
  const stage = req.user.role === "manager" ? "Under Manager Review" : "Under Finance Review"; if (c.status !== stage) throw new Error("This claim is not awaiting your review");
  if (req.user.role === "manager" && String(c.employeeId.managerId) !== String(req.user._id)) throw new Error("Not your team member");
  const need = c.expenses.filter((x) => x.verification?.status === "Needs Proof"); if (!need.length) throw new Error("Mark at least one item as Needs Proof first");
  c.status = "Proof Requested"; c.returnedTo = stage; c.approvals.push({ approverId: req.user._id, name: req.user.name, role: req.user.role, action: "Proof Requested", comment: need.map((x) => `${x.category}: ${x.verification.note}`).join(" | ") }); await c.save();
  await notify(c.employeeId._id, "More proof needed", `${c.code}: ${need.length} item(s) need more documents. Open the claim to upload them.`); res.json(c); }));
export default app;
