import { Router } from "express"; import jwt from "jsonwebtoken"; import bcrypt from "bcryptjs";
import { User, TravelRequest as TR, ExpenseClaim as EC, Policy, Notification } from "../models/index.js";
import { auth } from "../middleware/auth.js"; import { role } from "../middleware/role.js"; import { upload, storeReceipt } from "../middleware/upload.js";
import { wrap, code, inr, scope, total } from "../utils/helpers.js"; import { notify, notifyRole } from "../utils/notificationService.js"; import { checkPolicy } from "../utils/policyChecker.js";
import fs from "fs"; import { detectType, hashFile, cleanBill, billFlags, billKey } from "../utils/billVerifier.js";
const app = Router();
app.get("/api/claims", auth, wrap(async (req, res) => { const q = await scope(req.user);
  if (req.user.role === "finance") q.$or = [{ status: { $in: ["Under Finance Review", "Approved for Payment", "Paid", "Rejected"] } }, { status: "Proof Requested", returnedTo: "Under Finance Review" }];
  res.json(await EC.find(q).populate("employeeId", "name department").populate("travelRequestId", "code destination startDate endDate").sort("-createdAt")); }));
app.get("/api/claims/:id", auth, wrap(async (req, res) => { const q = await scope(req.user); const c = await EC.findOne({ _id: req.params.id, ...q })
  .populate("employeeId", "name department email").populate("travelRequestId"); if (!c) return res.status(404).json({ message: "Not found" }); res.json(c); }));
export const DECLARATION = "I confirm these bills are genuine, relate to this business trip, and have not been claimed elsewhere.";
const EXTRA = "Supporting document"; const dtype = (m) => String(m?.docType || "Document").trim().slice(0, 40) || "Document"; const dedupe = (a) => [...new Set(a.filter(Boolean))];
const nameOf = (f) => f.originalname.slice(0, 120);
const hashCtx = async (userId) => { const existing = await EC.find().select("employeeId expenses.category expenses.amount expenses.date expenses.vendor expenses.invoiceNo expenses.receiptHash expenses.documents.hash"); // fine at demo scale; index these fields for large data
  const all = existing.flatMap((c) => c.expenses);
  return { billKeys: new Set(all.map(billKey).filter(Boolean)), hashes: new Set(all.flatMap((x) => [x.receiptHash, ...(x.documents || []).map((d) => d.hash)]).filter(Boolean)),
    mine: new Set(existing.filter((c) => String(c.employeeId) === String(userId)).flatMap((c) => c.expenses).map((x) => [x.category, x.amount, new Date(x.date).toISOString().slice(0, 10)].join("|"))) }; };
const checkTypes = (files) => { for (const f of files) if (!detectType(f)) throw new Error(`"${f.originalname}" is not a valid PDF, JPG or PNG file`); };

app.post("/api/claims", auth, role("employee"), upload.any(), wrap(async (req, res) => {
  const cleanup = () => req.files.forEach((g) => fs.unlink(g.path, () => {}));
  try {
    const { travelRequestId, expenses, declaration } = JSON.parse(req.body.data);
    const trip = await TR.findOne({ _id: travelRequestId, employeeId: req.user._id }); if (!["Approved", "Trip Completed"].includes(trip?.status)) throw new Error("Claims need an approved trip");
    if (!expenses?.length) throw new Error("Add at least one expense"); if (declaration !== true) throw new Error("Please confirm the declaration before submitting");
    checkTypes(req.files); const policies = await Policy.find(); const ctx = await hashCtx(req.user._id);
    const items = []; for (const [i, e] of expenses.entries()) {
      const amount = +e.amount; if (!(amount > 0)) throw new Error("Each expense needs an amount greater than zero"); const p = policies.find((z) => z.category === e.category); const label = `${e.category} (item ${i + 1})`;
      const docs = (Array.isArray(e.docs) ? e.docs : []).slice(0, 5).map((m, j) => ({ file: req.files.find((f) => f.fieldname === `doc_${i}_${j}`), docType: dtype(m) })).filter((d) => d.file);
      const reason = String(e.missingReason || "").trim().slice(0, 300); const declared = !docs.length && !!reason;
      if (declared && !(p?.noReceiptLimit > 0 && amount <= p.noReceiptLimit)) throw new Error(`${label}: a missing-receipt declaration is only allowed up to ₹${p?.noReceiptLimit || 0}`);
      if (!declared && p) { const have = docs.map((d) => d.docType.toLowerCase()); const need = [...(p.requiredDocs || [])]; if (p.extraProofAbove > 0 && amount > p.extraProofAbove) need.push(EXTRA);
        const missing = need.filter((r) => !have.includes(r.toLowerCase())); if (missing.length) throw new Error(`${label}: missing required document(s): ${missing.join(", ")}`); }
      const bill = cleanBill(e), hashes = docs.map((d) => hashFile(d.file));
      const flags = [await checkPolicy(trip, { ...e, amount }, docs.length > 0 || declared), ...billFlags({ item: { ...bill, category: e.category, amount, date: e.date }, trip, hasFile: docs.length > 0, hash: hashes[0] || "", ctx })];
      for (const h of hashes.slice(1)) { if (ctx.hashes.has(h)) flags.push("Receipt Already Used"); ctx.hashes.add(h); } if (declared) flags.push("Missing Receipt Declared");
      const documents = []; for (const [j, d] of docs.entries()) documents.push({ docType: d.docType, name: nameOf(d.file), url: await storeReceipt(d.file), size: d.file.size, hash: hashes[j] });
      items.push({ category: e.category, amount, date: e.date, description: e.description, employeeNote: String(e.employeeNote || "").trim().slice(0, 500), ...bill, documents, receiptUrl: documents[0]?.url || "", receiptHash: hashes[0] || "",
        missingReceipt: declared ? { reason } : undefined, policyFlag: dedupe(flags).join(", "), verification: { status: "Pending" } }); }
    const claim = await EC.create({ code: await code(EC, "EC"), employeeId: req.user._id, travelRequestId, expenses: items, totalAmount: items.reduce((s, x) => s + x.amount, 0),
      declaration: { text: DECLARATION, by: req.user._id, byName: req.user.name, at: new Date() }, approvals: [{ approverId: req.user._id, name: req.user.name, role: "employee", action: "Submitted" }] });
    trip.status = "Expense Submitted"; await trip.save(); await notify(req.user.managerId, "Expense claim awaiting review", `${req.user.name} submitted ${claim.code} (${inr(claim.totalAmount)}).`); res.json(claim);
  } catch (err) { cleanup(); throw err; } }));

// Employee answers a "more proof" request: adds documents to the items that need it, and the claim returns to the reviewer who asked
app.post("/api/claims/:id/proof", auth, role("employee"), upload.any(), wrap(async (req, res) => {
  const cleanup = () => req.files.forEach((g) => fs.unlink(g.path, () => {}));
  try {
    const body = JSON.parse(req.body.data || "{}"); const c = await EC.findOne({ _id: req.params.id, employeeId: req.user._id }); if (c?.status !== "Proof Requested") throw new Error("This claim is not waiting for more proof");
    checkTypes(req.files); const ctx = await hashCtx(req.user._id); const needs = c.expenses.filter((x) => x.verification?.status === "Needs Proof"); if (!needs.length) throw new Error("No items need proof");
    for (const x of needs) { const entry = (body.items || []).find((z) => z.itemId === String(x._id));
      const docs = (Array.isArray(entry?.docs) ? entry.docs : []).slice(0, 5).map((m, j) => ({ file: req.files.find((f) => f.fieldname === `doc_${x._id}_${j}`), docType: dtype(m) })).filter((d) => d.file);
      if (!docs.length) throw new Error(`Add at least one document for ${x.category}${x.description ? " (" + x.description + ")" : ""}`);
      const flags = (x.policyFlag || "").split(", ").filter((f) => f && f !== "Receipt Required" && f !== "Missing Receipt Declared");
      for (const d of docs) { const hash = hashFile(d.file); if (ctx.hashes.has(hash)) flags.push("Receipt Already Used"); ctx.hashes.add(hash);
        x.documents.push({ docType: d.docType, name: nameOf(d.file), url: await storeReceipt(d.file), size: d.file.size, hash }); }
      x.receiptUrl = x.receiptUrl || x.documents[0].url; x.missingReceipt = undefined; if (entry.message) x.employeeNote = String(entry.message).trim().slice(0, 500);
      x.policyFlag = dedupe(flags).join(", "); x.verification = { status: "Pending" }; }
    const stage = c.returnedTo || "Under Manager Review"; c.status = stage; c.returnedTo = undefined; c.approvals.push({ approverId: req.user._id, name: req.user.name, role: "employee", action: "Proof Submitted" }); await c.save();
    if (stage === "Under Manager Review") await notify(req.user.managerId, "Proof submitted", `${req.user.name} added the documents you asked for on ${c.code}.`); else await notifyRole("finance", "Proof submitted", `${req.user.name} added the documents you asked for on ${c.code}.`);
    res.json(c);
  } catch (err) { cleanup(); throw err; } }));
export default app;
