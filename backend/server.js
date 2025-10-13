import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect DB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Register all models before routes
import "./src/models/Volunteer.js";
import "./src/models/Opportunity.js";
import "./src/models/Organization.js";

// Import routes
import authRoutes from "./src/routes/auth.routes.js";
import volunteerRoutes from "./src/routes/volunteer.routes.js";
import organizationRoutes from "./src/routes/organization.routes.js";
import opportunityRoutes from "./src/routes/opportunity.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
