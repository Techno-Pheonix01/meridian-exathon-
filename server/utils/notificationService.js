import nodemailer from "nodemailer"; import { User, Notification } from "../models/index.js";
const mailer = process.env.SMTP_HOST ? nodemailer.createTransport({ host: process.env.SMTP_HOST, port: +process.env.SMTP_PORT || 587, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }) : null;
// Always creates an in-app notification; also emails the user when SMTP is configured
export const notify = async (userId, title, message, type = "info") => { if (!userId) return; await Notification.create({ userId, title, message, type });
  if (!mailer) return; const u = await User.findById(userId); if (u?.email) mailer.sendMail({ from: process.env.MAIL_FROM || "Meridian <no-reply@meridian.local>", to: u.email, subject: `Meridian: ${title}`, text: message }).catch((e) => console.error("Mail failed:", e.message)); };
export const notifyRole = async (r, title, message) => { for (const u of await User.find({ role: r, isActive: true })) await notify(u._id, title, message); };
