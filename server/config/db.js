import mongoose from "mongoose";

// Connects to MongoDB. If the database is unreachable the server keeps running (so Render does not
// crash-loop) and retries every 10 seconds. While it is down, API calls get a clear 503 message.
export default function connectDB(onConnected) {
  const uri = process.env.MONGO_URI;
  if (!uri) { console.error("MONGO_URI is not set. Add it in Render > Environment (or server/.env locally)."); return; }
  const attempt = async () => {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log("MongoDB connected");
      if (onConnected) await onConnected();
    } catch (e) {
      console.error("MongoDB connection failed:", e.message, "- retrying in 10 seconds");
      setTimeout(attempt, 10000);
    }
  };
  attempt();
}
export const dbReady = () => mongoose.connection.readyState === 1;
