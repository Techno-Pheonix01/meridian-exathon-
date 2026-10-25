import { Router } from "express"; import jwt from "jsonwebtoken"; import bcrypt from "bcryptjs";
import { User, TravelRequest as TR, ExpenseClaim as EC, Policy, Notification } from "../models/index.js";
import { auth } from "../middleware/auth.js"; import { role } from "../middleware/role.js"; import { upload, storeReceipt } from "../middleware/upload.js";
import { wrap, code, inr, scope, total } from "../utils/helpers.js"; import { notify, notifyRole } from "../utils/notificationService.js"; import { checkPolicy } from "../utils/policyChecker.js";
const app = Router();
app.get("/api/notifications", auth, wrap(async (req, res) => res.json(await Notification.find({ userId: req.user._id }).sort("-createdAt").limit(50))));
app.post("/api/notifications/read", auth, wrap(async (req, res) => { await Notification.updateMany({ userId: req.user._id }, { read: true }); res.json({ ok: true }); }));
export default app;
