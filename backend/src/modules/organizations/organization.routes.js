import express from "express";
import { requireRole } from "../../middlewares/auth.middleware.js";
import {
  getOrganizationById,
  updateOrganization,
} from "./organization.controller.js";

const router = express.Router();
const isOrganization = requireRole("organization", "admin");

router.get("/dashboard", isOrganization, (req, res) => {
  res.json({
    message: "Welcome to the organization dashboard",
    user: req.user,
  });
});

router.get("/:id", getOrganizationById);
router.put("/:id", isOrganization, updateOrganization);

export default router;
