import mongoose from "mongoose";
const { Schema, model } = mongoose;
const id = (ref) => ({ type: Schema.Types.ObjectId, ref });
const hist = [{ approverId: id("User"), name: String, role: String, action: String, comment: String, timestamp: { type: Date, default: Date.now } }];
export const ExpenseClaim = model("ExpenseClaim", new Schema({ code: String, employeeId: id("User"), travelRequestId: id("TravelRequest"), totalAmount: Number, approvedAmount: Number, returnedTo: String, declaration: { text: String, by: id("User"), byName: String, at: Date },
  status: { type: String, default: "Under Manager Review" }, submittedAt: { type: Date, default: Date.now },
  expenses: [{ category: String, amount: Number, date: Date, description: String, receiptUrl: String, employeeNote: String, documents: [{ docType: String, name: String, url: String, size: Number, hash: String, uploadedAt: { type: Date, default: Date.now } }], missingReceipt: { reason: String }, policyFlag: String, vendor: String, invoiceNo: String, gstin: String, billAmount: Number, billDate: Date, receiptHash: String,
    verification: { status: { type: String, default: "Pending" }, by: id("User"), byName: String, role: String, at: Date, note: String }, managerRemark: String, financeRemark: String }],
  approvals: hist, payment: { amount: Number, date: Date, reference: String, financeUserId: id("User") } }, { timestamps: true }));
export default ExpenseClaim;
