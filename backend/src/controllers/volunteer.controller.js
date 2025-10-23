import Opportunity from "../models/Opportunity.js";
import Volunteer from "../models/Volunteer.js";

// get volunteer profile + stats
export const getMyProfile = async (req, res) => {
  try {
    const vol = await Volunteer.findById(req.user.id).lean();
    if (!vol) return res.status(404).json({ message: "Volunteer not found" });

    // send safe + gamification fields
    const {
      _id,
      fullName,
      email,
      birthdate,
      gender,
      contactNumber,
      city,
      address,
      skills = [],
      interests = [],
      availability,
      bio,
      points = 0,
      completedTasks = 0,
      badges = [],
      createdAt,
      updatedAt,
    } = vol;

    res.status(200).json({
      _id,
      fullName,
      email,
      birthdate,
      gender,
      contactNumber,
      city,
      address,
      skills,
      interests,
      availability,
      bio,
      points,
      completedTasks,
      badges,
      badgesCount: badges.length,
      createdAt,
      updatedAt,
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

export const getMyBadges = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.user.id).select(
      "badges points completedTasks"
    );

    if (!volunteer)
      return res.status(404).json({ message: "Volunteer not found" });

    res.status(200).json({
      badges: volunteer.badges || [],
      points: volunteer.points || 0,
      completedTasks: volunteer.completedTasks || 0,
    });
  } catch (err) {
    console.error("getMyBadges error:", err);
    res.status(500).json({ message: "Failed to load badges" });
  }
};

export const getMyOpportunities = async (req, res) => {
  try {
    const volunteerId = req.user?.id;

    if (!volunteerId)
      return res.status(401).json({ message: "Unauthorized: no volunteer ID" });

    // 🧠 Only fetch opportunities where:
    // - volunteer is still in the 'volunteers' array
    // - opportunity is not completed or closed
    const myOpportunities = await Opportunity.find({
      volunteers: volunteerId,
      status: { $nin: ["Completed", "Closed"] },
    })
      .populate("organization", "orgName")
      .sort({ date: 1 });

    res.status(200).json(myOpportunities);
  } catch (err) {
    console.error("❌ Error fetching volunteer opportunities:", err);
    res.status(500).json({ message: "Failed to load joined opportunities" });
  }
};

// Compute level and progress based on points
function computeLevelProgress(points) {
  const safePoints = Number(points) || 0;
  const pointsPerLevel = 100; // simple, predictable progression
  const level = Math.floor(safePoints / pointsPerLevel) + 1;
  const current = safePoints % pointsPerLevel;
  const target = pointsPerLevel;
  return {
    level,
    current,
    target,
    levelLabel: `Level ${level}`,
  };
}

// GET /volunteer/me/progress
export const getMyProgress = async (req, res) => {
  try {
    const me = await Volunteer.findById(req.user.id).select("points badges").lean();
    if (!me) return res.status(404).json({ message: "Volunteer not found" });

    const points = me.points || 0;
    const { level, current, target, levelLabel } = computeLevelProgress(points);

    // compute global rank: number with more points + 1
    const higher = await Volunteer.countDocuments({ points: { $gt: points } });
    const rank = higher + 1;

    res.status(200).json({
      current,
      target,
      level,
      levelLabel,
      rank,
      totalBadges: Array.isArray(me.badges) ? me.badges.length : 0,
    });
  } catch (err) {
    console.error("getMyProgress error:", err);
    res.status(500).json({ message: "Failed to load progress" });
  }
};

// GET /volunteer/top
export const getTopVolunteers = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 3));
    const top = await Volunteer.find({}, "fullName points")
      .sort({ points: -1 })
      .limit(limit)
      .lean();

    const items = top.map((v) => ({
      id: v._id,
      name: v.fullName || "Volunteer",
      points: v.points || 0,
    }));

    res.status(200).json(items);
  } catch (err) {
    console.error("getTopVolunteers error:", err);
    res.status(500).json({ message: "Failed to load leaderboard" });
  }
};


