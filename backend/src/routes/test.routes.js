import express from "express";
import { io } from "../../server.js";

const router = express.Router();

router.post("/notify/:volId", async (req, res) => {
  const { volId } = req.params;
  const testNotif = {
    title: "Test Notification",
    message: "This came from backend test route!",
    createdAt: new Date(),
  };

  io.to(`volunteer_${volId}`).emit("newNotification", testNotif);
  console.log(`📨 Sent test notification to volunteer_${volId}`);
  res.json({ ok: true, sentTo: `volunteer_${volId}` });
});

export default router;
