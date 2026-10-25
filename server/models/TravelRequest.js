import mongoose from "mongoose";
const { Schema, model } = mongoose;
const id = (ref) => ({ type: Schema.Types.ObjectId, ref });
const hist = [{ approverId: id("User"), name: String, role: String, action: String, comment: String, timestamp: { type: Date, default: Date.now } }];
export const TravelRequest = model("TravelRequest", new Schema({ code: String, employeeId: id("User"), destination: String, purpose: String, startDate: Date, endDate: Date,
  travelMode: String, accommodation: { required: Boolean, hotel: String, nights: Number }, travelCost: Number, accommodationCost: Number, otherCost: Number,
  estimatedCost: Number, projectCode: String, status: { type: String, default: "Draft" }, approvals: hist }, { timestamps: true }));
export default TravelRequest;
