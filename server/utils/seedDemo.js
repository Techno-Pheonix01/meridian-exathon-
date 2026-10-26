import bcrypt from "bcryptjs";
import { User, Policy } from "../models/index.js";
import { defaultPolicies } from "../defaultPolicies.js";

// Runs after every successful database connection. It never deletes anything.
export default async function seedDemo() {
  // The expense form needs the policy list, so make sure it exists.
  if (!(await Policy.countDocuments())) { await Policy.insertMany(defaultPolicies); console.log("Added the default expense policies"); }

  // DEMO MODE (off unless SEED_DEMO_USERS=true): creates four sample accounts if they are missing.
  if (process.env.SEED_DEMO_USERS !== "true") return;
  const password = await bcrypt.hash("demo123", 10); let mgr;
  for (const [name, email, role, department] of [["Arjun Menon", "manager@company.com", "manager", "Engineering"], ["Kavya Rao", "finance@company.com", "finance", "Finance"], ["Admin User", "admin@company.com", "admin", "Operations"], ["Pritimeena TV", "employee@company.com", "employee", "Engineering"]]) {
    let u = await User.findOne({ email });
    if (!u) { u = new User({ email, name, role, department, password, isActive: true }); if (role === "employee" && mgr) u.managerId = mgr._id; await u.save(); console.log("Demo account created:", email); }
    if (role === "manager") mgr = u;
  }
}
