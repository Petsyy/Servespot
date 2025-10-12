import Opportunity from "../models/Opportunity.js";
import Volunteer from "../models/Volunteer.js";

export const getMyProfile = async (req, res) => {
  try {
    const vol = await Volunteer.findById(req.user.id).lean();
    if (!vol) return res.status(404).json({ message: "Volunteer not found" });

    // send only safe fields
    const {
      _id, fullName, email, birthdate, gender, contactNumber,
      city, address, skills = [], interests = [], availability, bio,
      createdAt, updatedAt
    } = vol;

    res.status(200).json({
      _id, fullName, email,
      birthdate, gender, contactNumber,
      city, address, skills, interests, availability, bio,
      createdAt, updatedAt
    });
  } catch (err) {
    console.error("getMyProfile error:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const allowed = [
      "fullName","birthdate","gender","contactNumber",
      "city","address","skills","interests","availability","bio"
    ];

    // build $set from allowed fields only
    const updates = {};
    for (const k of allowed) {
      if (k in req.body) updates[k] = req.body[k];
    }

    // normalize arrays if they arrive as comma string
    if (typeof updates.skills === "string") {
      updates.skills = updates.skills.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (typeof updates.interests === "string") {
      updates.interests = updates.interests.split(",").map(s => s.trim()).filter(Boolean);
    }

    const vol = await Volunteer.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).lean();

    res.status(200).json(vol);
  } catch (err) {
    console.error("updateMyProfile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

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

