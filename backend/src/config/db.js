import mongoose from "mongoose";

let cachedPromise = null;
let lastDbError = null;

export const getLastDbError = () => lastDbError;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const rawUri = (process.env.MONGO_URI || "").trim().replace(/^['"]|['"]$/g, "");
  if (!rawUri) {
    lastDbError = "MONGO_URI is empty or undefined";
    throw new Error(lastDbError);
  }

  if (!cachedPromise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    };

    cachedPromise = mongoose
      .connect(rawUri, opts)
      .then((conn) => {
        lastDbError = null;
        console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((err) => {
        cachedPromise = null;
        lastDbError = err.message || String(err);
        console.error("❌ MongoDB connection error:", lastDbError);
        throw err;
      });
  }

  return cachedPromise;
};
