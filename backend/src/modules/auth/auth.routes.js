import express from "express";
import {
  registerVolunteer,
  registerOrganization,
  loginVolunteer,
  loginOrganization,
  sendOTP,
  verifyOTP,
  resetPassword,
  logoutSession,
  getSession,
  checkEmailAvailability,
} from "./auth.controller.js";

import { uploadDocs } from "../../middlewares/upload.middleware.js";
import { authLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.post("/volunteer/signup", authLimiter, registerVolunteer);
router.post("/volunteer/login", authLimiter, loginVolunteer);

router.post("/organization/signup", authLimiter, uploadDocs.single("document"), registerOrganization);
router.post("/organization/login", authLimiter, loginOrganization);

router.post("/send-otp", authLimiter, sendOTP);
router.post("/verify-otp", authLimiter, verifyOTP);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/logout", logoutSession);
router.get("/session", getSession);
router.get("/check-email", checkEmailAvailability);

export default router;
