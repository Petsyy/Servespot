import express from "express";

// Use the new separated upload logic
import { uploadImages, uploadProofs } from "../middlewares/upload.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

import {
  createOpportunity,
  getOpportunities,
  updateOpportunity,
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
  getOpportunityById,
} from "../controllers/opportunity.controller.js";

const router = express.Router();

const gone = (replacement) => (_req, res) => {
  res.status(410).json({
    message: "This endpoint has been deprecated.",
    replacement,
  });
};

// Public opportunities list (primary REST route)
router.get("/", getAllOpportunities);

// Legacy routes intentionally return 410 to prevent silent fallback to /:id
router.get("/all", gone("/api/opportunities"));


router.get("/organization/:orgId", gone("/api/opportunities/organizations/:orgId"));

// Canonical organization-scoped routes
router.get("/organizations/:orgId", getOpportunities);


// Get single opportunity by ID (legacy alias)
router.get("/view/:id", gone("/api/opportunities/:id"));

// Create & Update (with Image Upload)

// Create new opportunity (with poster/image)
router.post("/", uploadImages.single("file"), createOpportunity);

// Update opportunity (with new poster/image)
router.put("/:id", uploadImages.single("file"), updateOpportunity);

// Dashboard routes (organization-specific)
router.get("/organization/:orgId/stats", gone("/api/opportunities/organizations/:orgId/stats"));
router.get("/organization/:orgId/notifications", gone("/api/opportunities/organizations/:orgId/notifications"));
router.get("/organization/:orgId/activity", gone("/api/opportunities/organizations/:orgId/activity"));
router.get("/organizations/:orgId/stats", getStats);
router.get("/organizations/:orgId/notifications", getOrgNotifications);
router.get("/organizations/:orgId/activity", getActivity);
router.get("/:id/volunteers", getOpportunityVolunteers);


// Volunteer & Completion Management

// Volunteer sign-up
router.post("/:id/signup", verifyToken, volunteerSignup);

// Mark volunteer as completed
router.patch("/:oppId/confirm/:volunteerId", confirmVolunteerCompletion);

// Mark entire opportunity completed
router.patch("/:id/complete", markOpportunityCompleted);

// Submit and review proof
router.post("/:id/proof", verifyToken, uploadProofs.single("file"), submitCompletionProof);
router.patch("/:id/proof/:volunteerId/review", verifyToken, reviewCompletionProof);

// Force mark opportunity complete
router.patch("/:id/force-complete", forceCompleteOpportunity);


// Get single opportunity by ID (primary REST route)
router.get("/:id", getOpportunityById);

/* ------------------------------------------------
   Delete specific opportunity
------------------------------------------------ */
router.delete("/:id", deleteOpportunity);

export default router;
