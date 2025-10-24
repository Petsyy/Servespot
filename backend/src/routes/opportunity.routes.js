import express from "express";
import mongoose from "mongoose";
import Opportunity from "../models/Opportunity.js";

// ✅ Use the new separated upload logic
import { uploadImages } from "../middlewares/upload.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

import {
  createOpportunity,
  updateOpportunity,
  getOpportunities,
  getStats,
  getOrgNotifications,
  getActivity,
  deleteOpportunity,
  volunteerSignup,
  getOpportunityVolunteers,
  getAllOpportunities,
  confirmVolunteerCompletion,
  markOpportunityCompleted,
  submitCompletionProof,
  reviewCompletionProof,
  forceCompleteOpportunity,
} from "../controllers/opportunity.controller.js";

import { triggerReminderTest } from "../utils/reminderNotifications.js";

const router = express.Router();

/* ------------------------------------------------
   Public (Volunteer)
------------------------------------------------ */
router.get("/all", async (req, res) => {
  try {
    const opportunities = await Opportunity.find()
      .populate("organization", "orgName email location")
      .sort({ createdAt: -1 })
      .lean();

    const withCounts = opportunities.map((o) => ({
      ...o,
      currentVolunteers: o.volunteers?.length || 0,
    }));

    res.status(200).json(withCounts);
  } catch (err) {
    console.error("Error fetching opportunities:", err);
    res.status(500).json({ message: "Failed to fetch opportunities" });
  }
});

/* ------------------------------------------------
    Get opportunities posted by specific organization
------------------------------------------------ */
router.get("/organization/:orgId", async (req, res) => {
  try {
    const opportunities = await Opportunity.find({
      organization: req.params.orgId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const withCounts = opportunities.map((o) => ({
      ...o,
      currentVolunteers: o.volunteers?.length || 0,
    }));

    res.status(200).json(withCounts);
  } catch (err) {
    console.error("Error fetching org opportunities:", err);
    res.status(500).json({ message: "Failed to load organization data" });
  }
});

/* ------------------------------------------------
   Get single opportunity by ID
------------------------------------------------ */
router.get("/view/:id", async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity)
      return res.status(404).json({ message: "Opportunity not found" });
    res.json(opportunity);
  } catch (err) {
    console.error("Error fetching opportunity:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------------------------------------
   Create & Update (with Image Upload)
------------------------------------------------ */
// Create new opportunity (with poster/image)
router.post("/", uploadImages.single("file"), createOpportunity);

// Update opportunity (with new poster/image)
router.put("/:id", uploadImages.single("file"), updateOpportunity);

/* ------------------------------------------------
   Dashboard routes (organization-specific)
------------------------------------------------ */
router.get("/organization/:orgId/stats", getStats);
router.get("/organization/:orgId/notifications", getOrgNotifications);
router.get("/organization/:orgId/activity", getActivity);
router.get("/:id/volunteers", getOpportunityVolunteers);

/* ------------------------------------------------
   Volunteer & Completion Management
------------------------------------------------ */
// Volunteer sign-up
router.post("/:id/signup", verifyToken, volunteerSignup);

// Mark volunteer as completed
router.patch("/:oppId/confirm/:volunteerId", confirmVolunteerCompletion);

// Mark entire opportunity completed
router.patch("/:id/complete", markOpportunityCompleted);

// Submit and review proof
router.post("/:id/proof", verifyToken, uploadImages.single("file"), submitCompletionProof);
router.patch("/:id/proof/:volunteerId/review", verifyToken, reviewCompletionProof);

// Force mark opportunity complete
router.patch("/:id/force-complete", forceCompleteOpportunity);

// (Removed) Test reminder notifications route

/* ------------------------------------------------
   Delete specific opportunity
------------------------------------------------ */
router.delete("/:id", deleteOpportunity);

export default router;
