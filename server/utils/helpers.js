import { User, TravelRequest } from "../models/index.js";
export const wrap = (fn) => (req, res) => fn(req, res).catch((e) => res.status(400).json({ message: e.message }));
export const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");
export const scope = async (u) => { if (u.role === "employee") return { employeeId: u._id };
  if (u.role === "manager") return { employeeId: { $in: (await User.find({ managerId: u._id })).map((x) => x._id) } }; return {}; };
export const total = (b) => (+b.travelCost || 0) + (+b.accommodationCost || 0) + (+b.otherCost || 0);
export const code = async (M, p) => `${p}-${1000 + (await M.countDocuments())}`;
