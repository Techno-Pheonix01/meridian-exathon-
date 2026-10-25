import { Policy } from "../models/index.js";
export const checkPolicy = async (trip, ex, hasFile) => { const p = await Policy.findOne({ category: ex.category }); const f = [];
  if (p?.receiptRequired && !hasFile) f.push("Receipt Required"); if (p && ex.amount > p.maxAmount) f.push("Above Policy Limit");
  const d = new Date(ex.date); if (d < new Date(trip.startDate).setHours(0,0,0,0) || d > new Date(trip.endDate).setHours(23,59,59,999)) f.push("Outside Trip Period");
  if (p?.requiresPreApproval && !["Approved", "Trip Completed", "Expense Submitted"].includes(trip.status)) f.push("Pre-Approval Missing"); return f.join(", "); };
