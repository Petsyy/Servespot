import express from "express";
import {
  getNotifications,
  getVolunteerNotifications,
  markAsRead,
  markAllNotificationsRead,
  getOrganizationNotifications,
} from "./notification.controller.js";
import { requireRole, requireAuth } from "../../middlewares/auth.middleware.js";

const router = express.Router();

const isVolunteer = requireRole("volunteer");
const isOrganization = requireRole("organization", "admin");

router.get("/", requireAuth, getNotifications);
router.patch("/:id/read", requireAuth, markAsRead);

router.get("/volunteer", isVolunteer, getVolunteerNotifications);
router.put("/volunteer/read-all", isVolunteer, markAllNotificationsRead);

router.get("/organization/:orgId", isOrganization, getOrganizationNotifications);
router.put("/organization/:orgId/read-all", isOrganization, markAllNotificationsRead);

export default router;
