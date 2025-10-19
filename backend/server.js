import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Register models
import "./src/models/Volunteer.js";
import "./src/models/Opportunity.js";
import "./src/models/Organization.js";
import "./src/models/Admin.js";

// Import routes
import adminRoutes from "./src/routes/admin.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import volunteerRoutes from "./src/routes/volunteer.routes.js";
import organizationRoutes from "./src/routes/organization.routes.js";
import opportunityRoutes from "./src/routes/opportunity.routes.js";
import orgVolunteerRoutes from "./src/routes/manage.routes.js";

// Mount routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/org/volunteers", orgVolunteerRoutes);

// Serve uploads
app.use("/uploads", express.static("uploads"));

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
