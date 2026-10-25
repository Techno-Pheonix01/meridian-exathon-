import jwt from "jsonwebtoken"; import { User } from "../models/index.js";
export const auth = async (req, res, next) => { try { const { id } = jwt.verify((req.headers.authorization || "").replace("Bearer ", ""), process.env.JWT_SECRET);
  req.user = await User.findById(id); if (!req.user?.isActive) throw 0; next(); } catch { res.status(401).json({ message: "Unauthorized" }); } };
