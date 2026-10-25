import "dotenv/config"; import express from "express"; import cors from "cors"; import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"; import travelRoutes from "./routes/travelRoutes.js"; import expenseRoutes from "./routes/expenseRoutes.js"; import financeRoutes from "./routes/financeRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js"; import reportRoutes from "./routes/reportRoutes.js"; import notificationRoutes from "./routes/notificationRoutes.js"; import adminRoutes from "./routes/adminRoutes.js";
const app = express(); app.use(cors(), express.json()); app.use("/uploads", express.static("uploads"));
app.use(authRoutes, oauthRoutes, travelRoutes, expenseRoutes, financeRoutes, reportRoutes, notificationRoutes, adminRoutes);
await connectDB(); app.listen(process.env.PORT || 5000, () => {
  console.log("Meridian API running");
  const roleChoice = process.env.SIGNUP_ROLE_CHOICE !== "false" && process.env.NODE_ENV !== "production";
  console.log(roleChoice ? "Sign-up role choice: ON (testing mode). Set NODE_ENV=production or SIGNUP_ROLE_CHOICE=false before going live." : "Sign-up role choice: OFF (new sign-ups are employees)");
  for (const [n, k] of [["Google", "GOOGLE"], ["LinkedIn", "LINKEDIN"]]) console.log(`${n} sign-in: ${process.env[k + "_CLIENT_ID"] && process.env[k + "_CLIENT_SECRET"] ? "configured" : "NOT configured (see docs/OAUTH_SETUP.md)"}`);
});
