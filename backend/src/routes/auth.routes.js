import express from "express";
import {
  registerVolunteer,
  registerOrganization,
  loginVolunteer,
  loginOrganization,
  sendOTP,
  verifyOTP,
  resetPassword
} from "../controllers/auth.controller.js";

const router = express.Router();

// Signup
router.post("/volunteer/signup", registerVolunteer);
router.post("/organization/signup", registerOrganization);

// Login
router.post("/volunteer/login", loginVolunteer);
router.post("/organization/login", loginOrganization);

// Forgot Password Routes
router.post("/send-otp", sendOTP);-
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;
