import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getMyTasks } from "../controllers/volunteer.controller.js";

const router = express.Router();

router.get("/me/tasks", verifyToken, getMyTasks);

router.get("/dashboard", protect, (req, res) => {
  res.json({
    message: "Welcome to the volunteer dashboard",
    user: req.user, // includes id + role from token
  });
});

export default router;
