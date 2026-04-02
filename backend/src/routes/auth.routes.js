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
} from "../controllers/auth.controller.js";

import { uploadDocs } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Volunteer signup/login
router.post("/volunteer/signup", registerVolunteer);
router.post("/volunteer/login", loginVolunteer);

// Organization signup/login
router.post("/organization/signup", uploadDocs.single("document"), registerOrganization);
router.post("/organization/login", loginOrganization);

// Forgot password (OTP flow)
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/logout", logoutSession);
router.get("/session", getSession);

export default router;
