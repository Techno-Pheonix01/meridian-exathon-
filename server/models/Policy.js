import mongoose from "mongoose";
const { Schema, model } = mongoose;
const id = (ref) => ({ type: Schema.Types.ObjectId, ref });
export const Policy = model("Policy", new Schema({ category: String, maxAmount: Number, receiptRequired: Boolean, requiresPreApproval: Boolean, requiredDocs: [String], extraProofAbove: { type: Number, default: 0 }, noReceiptLimit: { type: Number, default: 0 } }));
export default Policy;
