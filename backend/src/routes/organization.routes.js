import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getOrganizationById,
  updateOrganization,
} from "../controllers/organization.controller.js";

const router = express.Router();

router.get("/dashboard", protect, (req, res) => {
  res.json({
    message: "Welcome to the organization dashboard",
    user: req.user,
  });
});

// Fetch organization by ID
router.get("/:id", getOrganizationById);

// Update organization details
router.put("/:id", updateOrganization);

export default router;
