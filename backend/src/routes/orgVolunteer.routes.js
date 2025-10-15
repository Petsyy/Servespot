import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getOrgVolunteers,
  updateOrgVolunteerStatus,
} from "../controllers/orgVolunteer.controller.js";

const router = express.Router();

// ✅ GET all volunteers under this organization
router.get("/", verifyToken, getOrgVolunteers);

// ✅ PUT update a volunteer’s status
router.put("/:id/status", verifyToken, updateOrgVolunteerStatus);

export default router;
