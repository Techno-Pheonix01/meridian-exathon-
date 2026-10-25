// Creates (or repairs) the four demo accounts WITHOUT deleting anything: manager@, finance@, admin@, employee@company.com, password demo123.
import "dotenv/config"; import mongoose from "mongoose"; import bcrypt from "bcryptjs";
import { User, Policy } from "./models/index.js"; import { defaultPolicies } from "./defaultPolicies.js";
await mongoose.connect(process.env.MONGO_URI); const password = await bcrypt.hash("demo123", 10); let mgr;
for (const [name, email, role, department] of [["Arjun Menon", "manager@company.com", "manager", "Engineering"], ["Kavya Rao", "finance@company.com", "finance", "Finance"], ["Admin User", "admin@company.com", "admin", "Operations"], ["Pritimeena TV", "employee@company.com", "employee", "Engineering"]]) {
  let u = await User.findOne({ email }); const created = !u; if (!u) u = new User({ email }); Object.assign(u, { name, role, department, password, isActive: true });
  if (role === "employee" && mgr) u.managerId = mgr._id; await u.save(); if (role === "manager") mgr = u; console.log(`${created ? "created " : "updated "} ${email}  (${role})`); }
if (!(await Policy.countDocuments())) { await Policy.insertMany(defaultPolicies); console.log("added the default expense policies"); }
console.log("\nDone. Log in with any of these emails, password: demo123"); process.exit();
