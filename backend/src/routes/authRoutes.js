import express from "express";
import {
  registerVolunteer,
  registerOrganization,
  loginVolunteer,
  loginOrganization,
} from "../controllers/authController.js";

const router = express.Router();

// Signup
router.post("/volunteer/signup", registerVolunteer);
router.post("/organization/signup", registerOrganization);

// Login
router.post("/volunteer/login", loginVolunteer);
router.post("/organization/login", loginOrganization);


export default router;
