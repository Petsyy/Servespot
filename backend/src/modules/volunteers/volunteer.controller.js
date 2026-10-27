import { volunteerService } from "./volunteer.service.js";

export const getMyProfile = async (req, res) => {
  try {
    const profile = await volunteerService.getProfile(req.user.id);
    res.status(200).json(profile);
  } catch (err) {
    console.error("getMyProfile error:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to load profile" });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const updated = await volunteerService.updateProfile(req.user.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    console.error("updateMyProfile error:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to update profile" });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await volunteerService.getTasks(req.user?.id);
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error fetching volunteer tasks:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to load volunteer tasks" });
  }
};

export const getMyBadges = async (req, res) => {
  try {
    const badgesData = await volunteerService.getBadges(req.user.id);
    res.status(200).json(badgesData);
  } catch (err) {
    console.error("getMyBadges error:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to load badges" });
  }
};

export const getVolunteerLeaderboard = async (_req, res) => {
  try {
    const leaderboardData = await volunteerService.getLeaderboard(10);
    res.status(200).json(leaderboardData);
  } catch (err) {
    console.error("getVolunteerLeaderboard error:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to load leaderboard" });
  }
};

export const getMyOpportunities = async (req, res) => {
  try {
    const opportunities = await volunteerService.getOpportunities(req.user?.id);
    res.status(200).json(opportunities);
  } catch (err) {
    console.error("Error fetching volunteer opportunities:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to load joined opportunities" });
  }
};

export const getMyProgress = async (req, res) => {
  try {
    const progress = await volunteerService.getProgress(req.user.id);
    res.status(200).json(progress);
  } catch (err) {
    console.error("getMyProgress error:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to load progress" });
  }
};

export const getTopVolunteers = async (req, res) => {
  try {
    const top = await volunteerService.getTopVolunteers(req.query.limit);
    res.status(200).json(top);
  } catch (err) {
    console.error("getTopVolunteers error:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to load leaderboard" });
  }
};
