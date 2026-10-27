import { volunteerRepository } from "./volunteer.repository.js";
import { getVolunteerLevel, getNextMilestone } from "../../utils/volunteer.badges.js";

function computeLevelProgress(points) {
  const safePoints = Number(points) || 0;
  const pointsPerLevel = 100;
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

export class VolunteerService {
  constructor({ volunteers = volunteerRepository } = {}) {
    this.volunteers = volunteers;
  }

  async getProfile(id) {
    const vol = await this.volunteers.findById(id, { lean: true });
    if (!vol) {
      const err = new Error("Volunteer not found");
      err.status = 404;
      throw err;
    }

    const completedOps = await this.volunteers.findCompletedOpportunities(id);
    const totalHours = completedOps.reduce((sum, opp) => {
      const match = String(opp.duration || "").match(/(\d+(\.\d+)?)/);
      const hours = match ? parseFloat(match[1]) : 0;
      return sum + hours;
    }, 0);

    const {
      _id,
      fullName,
      email,
      birthdate,
      gender,
      contactNumber,
      region,
      province,
      city,
      barangay,
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

    return {
      _id,
      fullName,
      email,
      birthdate,
      gender,
      contactNumber,
      region,
      province,
      city,
      barangay,
      address,
      skills,
      interests,
      availability,
      bio,
      points,
      completedTasks,
      badges,
      badgesCount: badges.length,
      hours: totalHours,
      createdAt,
      updatedAt,
    };
  }

  async updateProfile(id, body) {
    const allowed = [
      "fullName",
      "birthdate",
      "gender",
      "contactNumber",
      "region",
      "province",
      "city",
      "barangay",
      "address",
      "skills",
      "interests",
      "availability",
      "bio",
    ];

    const updates = {};
    for (const k of allowed) {
      if (k in body) updates[k] = body[k];
    }

    if (typeof updates.skills === "string") {
      updates.skills = updates.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (typeof updates.interests === "string") {
      updates.interests = updates.interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    return this.volunteers.updateById(id, { $set: updates }, { new: true, lean: true });
  }

  async getTasks(volunteerId) {
    if (!volunteerId) {
      const err = new Error("Unauthorized: no volunteer ID");
      err.status = 401;
      throw err;
    }
    return this.volunteers.findJoinedTasks(volunteerId);
  }

  async getBadges(volunteerId) {
    const volunteer = await this.volunteers.findById(volunteerId, {
      select: "badges points completedTasks fullName",
    });

    if (!volunteer) {
      const err = new Error("Volunteer not found");
      err.status = 404;
      throw err;
    }

    const level = getVolunteerLevel(volunteer.points || 0);
    const milestone = getNextMilestone(volunteer.completedTasks || 0);

    return {
      badges: volunteer.badges || [],
      points: volunteer.points || 0,
      completedTasks: volunteer.completedTasks || 0,
      level,
      nextMilestone: milestone,
      volunteerName: volunteer.fullName,
    };
  }

  async getLeaderboard(limit = 10) {
    const volunteers = await this.volunteers.activeLeaderboard(limit);

    const leaderboard = volunteers.map((volunteer, index) => {
      const level = getVolunteerLevel(volunteer.points || 0);

      return {
        rank: index + 1,
        name: volunteer.fullName,
        points: volunteer.points || 0,
        completedTasks: volunteer.completedTasks || 0,
        badges: volunteer.badges?.length || 0,
        level,
      };
    });

    return {
      leaderboard,
      totalVolunteers: volunteers.length,
    };
  }

  async getOpportunities(volunteerId) {
    if (!volunteerId) {
      const err = new Error("Unauthorized: no volunteer ID");
      err.status = 401;
      throw err;
    }
    return this.volunteers.findActiveJoinedOpportunities(volunteerId);
  }

  async getProgress(volunteerId) {
    const me = await this.volunteers.findById(volunteerId, {
      select: "points badges",
      lean: true,
    });
    if (!me) {
      const err = new Error("Volunteer not found");
      err.status = 404;
      throw err;
    }

    const points = me.points || 0;
    const { level, current, target, levelLabel } = computeLevelProgress(points);
    const higher = await this.volunteers.countHigherPoints(points);
    const rank = higher + 1;

    return {
      current,
      target,
      level,
      levelLabel,
      rank,
      totalBadges: Array.isArray(me.badges) ? me.badges.length : 0,
    };
  }

  async getTopVolunteers(limit = 3) {
    const safeLimit = Math.max(1, Math.min(50, Number(limit) || 3));
    const top = await this.volunteers.findTopVolunteers(safeLimit);

    return top.map((v) => ({
      id: v._id,
      name: v.fullName || "Volunteer",
      points: v.points || 0,
    }));
  }
}

export const volunteerService = new VolunteerService();
