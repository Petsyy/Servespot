import express from "express";
import {
  loginAdmin,
  getAdminProfile,
  getDashboardData,
  getReportsData,
  getAllOrganizations,
  updateOrganizationStatus,
  getAllVolunteers,
  updateVolunteerStatus,
  getAdminNotifications,
  markAdminNotificationsRead,
} from "./admin.controller.js";
import { protectAdmin } from "../../middlewares/auth.middleware.js";
import { authLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.post("/login", authLimiter, loginAdmin);
router.get("/profile/:id", protectAdmin, getAdminProfile);

router.get("/dashboard", protectAdmin, getDashboardData);
router.get("/reports", protectAdmin, getReportsData);

router.get("/organizations", protectAdmin, getAllOrganizations);
router.put("/organizations/:id/status", protectAdmin, updateOrganizationStatus);

router.get("/volunteers", protectAdmin, getAllVolunteers);
router.put("/volunteers/:id/status", protectAdmin, updateVolunteerStatus);

router.get("/:adminId/notifications", protectAdmin, getAdminNotifications);
router.put(
  "/:adminId/notifications/read",
  protectAdmin,
  markAdminNotificationsRead
);

export default router;
