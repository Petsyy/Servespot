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

const router = express.Router();

router.post("/volunteer/signup", registerVolunteer);
router.post("/volunteer/login", loginVolunteer);

router.post("/organization/signup", uploadDocs.single("document"), registerOrganization);
router.post("/organization/login", loginOrganization);

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/logout", logoutSession);
router.get("/session", getSession);
router.get("/check-email", checkEmailAvailability);

export default router;
