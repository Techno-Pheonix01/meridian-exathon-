import mongoose from "mongoose";
const { Schema, model } = mongoose;
const id = (ref) => ({ type: Schema.Types.ObjectId, ref });
export const Notification = model("Notification", new Schema({ userId: id("User"), title: String, message: String, type: String, read: { type: Boolean, default: false } }, { timestamps: true }));
export default Notification;
