import express from 'express';
import { loginAdmin } from '../controllers/admin.controller.js'; // import your login controller
import { protectAdmin } from '../middlewares/auth.middleware.js'; // admin authentication middleware

const router = express.Router();

// Admin Login Route
router.post('/login', loginAdmin);

// Example of a protected route: Admin Dashboard
router.get('/dashboard', protectAdmin, (req, res) => {
  res.status(200).json({ message: "Welcome to the Admin Dashboard" });
});

export default router;
