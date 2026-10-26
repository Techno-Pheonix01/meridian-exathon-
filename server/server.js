import "dotenv/config"; import express from "express"; import cors from "cors"; import connectDB, { dbReady } from "./config/db.js"; import seedDemo from "./utils/seedDemo.js";
import authRoutes from "./routes/authRoutes.js"; import travelRoutes from "./routes/travelRoutes.js"; import expenseRoutes from "./routes/expenseRoutes.js"; import financeRoutes from "./routes/financeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js"; import notificationRoutes from "./routes/notificationRoutes.js"; import adminRoutes from "./routes/adminRoutes.js";

if (!process.env.JWT_SECRET) { console.error("JWT_SECRET is not set. Add a long random value in Render > Environment (or server/.env locally)."); process.exit(1); }

const app = express();
// CLIENT_URL (optional) = your Vercel address(es), comma separated. Leave it empty to allow any website to call the API.
const origins = (process.env.CLIENT_URL || "").split(",").map((s) => s.trim().replace(/\/+$/, "")).filter(Boolean);
app.use(cors(origins.length ? { origin: origins } : undefined), express.json());
app.use("/uploads", express.static("uploads"));

// Open the Render URL in a browser to check the server is alive.
app.get("/", (req, res) => res.json({ app: "Meridian API", status: "running", database: dbReady() ? "connected" : "not connected" }));
app.get("/api/health", (req, res) => res.json({ status: "ok", database: dbReady() ? "connected" : "not connected" }));

// If MongoDB is down, answer with a clear message instead of hanging.
app.use("/api", (req, res, next) => (dbReady() || req.path === "/auth/config" ? next() : res.status(503).json({ message: "The database is not connected right now. Please try again in a minute." })));

app.use(authRoutes, travelRoutes, expenseRoutes, financeRoutes, reportRoutes, notificationRoutes, adminRoutes);
app.use("/api", (req, res) => res.status(404).json({ message: `No such API route: ${req.method} ${req.originalUrl}` }));

app.listen(process.env.PORT || 5000, () => {
  console.log("Meridian API running");
  const roleChoice = process.env.SIGNUP_ROLE_CHOICE !== "false" && process.env.NODE_ENV !== "production";
  console.log(roleChoice ? "Sign-up role choice: ON (testing mode). Set NODE_ENV=production before going live." : "Sign-up role choice: OFF (new sign-ups are employees)");
  console.log(process.env.SEED_DEMO_USERS === "true" ? "Demo accounts: ON" : "Demo accounts: OFF");
  connectDB(seedDemo);
});
