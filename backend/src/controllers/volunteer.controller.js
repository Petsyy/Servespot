import Opportunity from "../models/Opportunity.js";

export const getMyTasks = async (req, res) => {
  try {
    const volunteerId = req.user.id; // decoded from token

    const tasks = await Opportunity.find({ volunteers: volunteerId })
      .populate("organization", "orgName location")
      .sort({ date: -1 });

    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error fetching volunteer tasks:", err);
    res.status(500).json({ message: "Failed to load volunteer tasks" });
  }
};
