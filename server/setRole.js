// Change the role of an existing account:  npm run set-role -- alex@example.com manager
import "dotenv/config"; import mongoose from "mongoose"; import { User } from "./models/index.js";
const [email, role] = process.argv.slice(2); const ROLES = ["employee", "manager", "finance", "admin"];
await mongoose.connect(process.env.MONGO_URI); const list = async () => { console.log("\nAccounts in the database:"); for (const x of await User.find().select("email role name")) console.log(`  - ${x.email}  (${x.role})  ${x.name}`); };
if (!email || !ROLES.includes(role)) { console.log("Usage: npm run set-role -- <email> <employee|manager|finance|admin>"); await list(); process.exit(1); }
const u = await User.findOne({ email: email.trim().toLowerCase() }); if (!u) { console.log(`No account with the email "${email}".`); await list(); process.exit(1); }
u.role = role; u.isActive = true; await u.save(); console.log(`${u.email} is now a ${role}. Log out and log in again (or refresh the page).`); process.exit();
