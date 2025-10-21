import express from "express";
import {
  loginAdmin,
  getAllOrganizations,
  updateOrganizationStatus,
  getAllVolunteers,
  updateVolunteerStatus,
} from "../controllers/admin.controller.js";
import { protectAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =====================================================
   ADMIN AUTH
===================================================== */
router.post("/login", loginAdmin);

/* =====================================================
    ADMIN DASHBOARD (Example Protected)
===================================================== */
router.get("/dashboard", protectAdmin, (req, res) => {
  res.status(200).json({ message: "Welcome to the Admin Dashboard" });
});

/* =====================================================
   ORGANIZATION MANAGEMENT
===================================================== */
router.get("/organizations", protectAdmin, getAllOrganizations);
router.put("/organizations/:id/status", protectAdmin, updateOrganizationStatus);

/* =====================================================
    VOLUNTEER MANAGEMENT
===================================================== */
router.get("/volunteers", protectAdmin, getAllVolunteers);
router.put("/volunteers/:id/status", protectAdmin, updateVolunteerStatus);

export default router;
