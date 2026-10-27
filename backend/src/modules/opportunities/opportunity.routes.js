import express from "express";

import { uploadImages, uploadProofs } from "../../middlewares/upload.middleware.js";
import { requireRole } from "../../middlewares/auth.middleware.js";

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
} from "./opportunity.controller.js";

const router = express.Router();

const isVolunteer = requireRole("volunteer");
const isOrganization = requireRole("organization", "admin");

const gone = (replacement) => (_req, res) => {
  res.status(410).json({
    message: "This endpoint has been deprecated.",
    replacement,
  });
};

router.get("/", getAllOpportunities);

router.get("/all", gone("/api/opportunities"));
router.get("/organization/:orgId", gone("/api/opportunities/organizations/:orgId"));

router.get("/organizations/:orgId", getOpportunities);

router.get("/view/:id", gone("/api/opportunities/:id"));

router.post("/", isOrganization, uploadImages.single("file"), createOpportunity);
router.put("/:id", isOrganization, uploadImages.single("file"), updateOpportunity);

router.get("/organization/:orgId/stats", gone("/api/opportunities/organizations/:orgId/stats"));
router.get("/organization/:orgId/notifications", gone("/api/opportunities/organizations/:orgId/notifications"));
router.get("/organization/:orgId/activity", gone("/api/opportunities/organizations/:orgId/activity"));
router.get("/organizations/:orgId/stats", isOrganization, getStats);
router.get("/organizations/:orgId/notifications", isOrganization, getOrgNotifications);
router.get("/organizations/:orgId/activity", isOrganization, getActivity);
router.get("/:id/volunteers", isOrganization, getOpportunityVolunteers);

router.post("/:id/signup", isVolunteer, volunteerSignup);
router.post("/:id/proof", isVolunteer, uploadProofs.single("file"), submitCompletionProof);

router.patch("/:oppId/confirm/:volunteerId", isOrganization, confirmVolunteerCompletion);
router.patch("/:id/complete", isOrganization, markOpportunityCompleted);
router.patch("/:id/proof/:volunteerId/review", isOrganization, reviewCompletionProof);
router.patch("/:id/force-complete", isOrganization, forceCompleteOpportunity);

router.get("/:id", getOpportunityById);

router.delete("/:id", isOrganization, deleteOpportunity);

export default router;
