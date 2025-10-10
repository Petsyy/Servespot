import express from "express";
import mongoose from "mongoose";
import multer from "multer";

import { upload } from "../middlewares/upload.middleware.js";
import {
  createOpportunity,
  getOpportunities,
  getStats,
  getNotifications,
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
import Opportunity from "../models/Opportunity.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public (Volunteer)
router.get("/all", getAllOpportunities);
/**
 * @desc Get all opportunities (for volunteers to browse)
 * @route GET /api/opportunities/all
 */
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

/**
 * @desc Get opportunities posted by specific organization
 * @route GET /api/opportunities/organization/:orgId
 */
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

/**
 * @desc Get single opportunity by ID
 * @route GET /api/opportunities/view/:id
 */
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

/**
 * @desc Mark a volunteer as completed for a specific opportunity
 * @route PATCH /api/opportunities/:oppId/confirm/:volunteerId
 */
router.patch("/:oppId/confirm/:volunteerId", confirmVolunteerCompletion);

/**
 * @desc Create new opportunity (with file upload)
 * @route POST /api/opportunities
 */
router.post("/", upload.single("file"), createOpportunity);

/**
 * @desc Dashboard routes (organization-specific)
 */
router.get("/organization/:orgId/stats", getStats);
router.get("/organization/:orgId/notifications", getNotifications);
router.get("/organization/:orgId/activity", getActivity);
router.get("/:id/volunteers", getOpportunityVolunteers);

/**
 * @desc Mark entire opportunity as completed (organization action)
 * @route PATCH /api/opportunities/:id/complete
 */
router.patch("/:id/complete", markOpportunityCompleted);

router.post("/:id/proof", verifyToken, upload.single("file"), submitCompletionProof);
router.patch("/:id/proof/:volunteerId/review", verifyToken, reviewCompletionProof);
router.patch("/:id/force-complete", forceCompleteOpportunity);

/**
 * @desc Delete specific opportunity
 * @route DELETE /api/opportunities/:id
 */
router.delete("/:id", deleteOpportunity);

/**
 * @desc Volunteer sign-up for opportunity
 * @route POST /api/opportunities/:id/signup
 */
router.post("/:id/signup", verifyToken, volunteerSignup);

export default router;
