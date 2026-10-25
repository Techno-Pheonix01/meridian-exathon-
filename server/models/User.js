import mongoose from "mongoose";
const { Schema, model } = mongoose;
const id = (ref) => ({ type: Schema.Types.ObjectId, ref });
export const User = model("User", new Schema({ name: String, email: { type: String, unique: true, lowercase: true }, password: String,
  role: { type: String, enum: ["employee", "manager", "finance", "admin"] }, department: String, managerId: id("User"), isActive: { type: Boolean, default: true }, avatarUrl: String, lastLogin: Date, authProviders: [{ provider: String, providerId: String, _id: false }] }, { timestamps: true }));
export default User;
