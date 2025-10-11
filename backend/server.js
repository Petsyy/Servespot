import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
import authRoutes from "./src/routes/auth.routes.js";
app.use("/api/auth", authRoutes);

// Volunteer routes
import volunteerRoutes from "./src/routes/volunteer.routes.js";
app.use("/api/volunteer", volunteerRoutes);

// Organization routes
import organizationRoutes from "./src/routes/organization.routes.js";
app.use("/api/organization", organizationRoutes);
import opportunityRoutes from "./src/routes/opportunity.routes.js";
app.use("/api/opportunities", opportunityRoutes);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
