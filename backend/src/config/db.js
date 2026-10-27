import mongoose from "mongoose";

let cachedPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedPromise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
    };
    cachedPromise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((conn) => {
        console.log(` MongoDB Connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((err) => {
        cachedPromise = null;
        console.error(" MongoDB connection error:", err.message);
        throw err;
      });
  }

  return cachedPromise;
};
