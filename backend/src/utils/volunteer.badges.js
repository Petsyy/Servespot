import Volunteer from "../models/Volunteer.js";
import { sendNotification } from "./sendNotification.js";

/**
 * Award points and badges to a volunteer based on completed tasks.
 * Returns the list of newly earned badges (if any).
 */
export const awardVolunteerRewards = async (volunteerId) => {
  try {
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      console.error("Volunteer not found:", volunteerId);
      return [];
    }

    // Calculate points based on task complexity and volunteer level
    const basePoints = 20;
    const bonusPoints = Math.floor(volunteer.completedTasks / 5) * 5; // Bonus for every 5 tasks
    const totalPoints = basePoints + bonusPoints;

    // Update volunteer stats
    volunteer.points = (volunteer.points || 0) + totalPoints;
    volunteer.completedTasks = (volunteer.completedTasks || 0) + 1;

    const taskCount = volunteer.completedTasks;
    const existingBadges = volunteer.badges?.map((b) => b.name) || [];
    const newBadges = [];

    // Comprehensive milestone system
    const milestones = [
      {
        count: 1,
        name: "First Step",
        description: "Completed your first volunteering task!",
        icon: "✨",
        points: 20,
      },
      {
        count: 2,
        name: "Active Helper",
        description: "Completed 2 volunteering tasks — consistency matters!",
        icon: "💪",
        points: 30,
      },
      {
        count: 3,
        name: "Helping Hand",
        description: "Completed 3 volunteering tasks — you're making an impact!",
        icon: "🖐️",
        points: 50,
      },
      {
        count: 4,
        name: "Community Hero",
        description: "Completed 4 volunteering tasks — outstanding dedication!",
        icon: "🏅",
        points: 100,
      },
      {
        count: 5,
        name: "Neighborhood Legend",
        description: "Completed 5 volunteering tasks — your passion inspires others!",
        icon: "🔥",
        points: 150,
      },
      {
        count: 6,
        name: "Volunteer Champion",
        description: "Completed 6 volunteering tasks — a true force for good!",
        icon: "🏆",
        points: 250,
      },
      {
        count: 7,
        name: "Volunteer Master",
        description: "Completed 7 volunteering tasks — you're a legend!",
        icon: "👑",
        points: 500,
      },
      {
        count: 8,
        name: "Volunteer Legend",
        description: "Completed 8 volunteering tasks — you're an inspiration!",
        icon: "🌟",
        points: 1000,
      },
    ];

    // Check for milestone achievements
    for (const milestone of milestones) {
      if (
        taskCount === milestone.count &&
        !existingBadges.includes(milestone.name)
      ) {
        const badge = {
          name: milestone.name,
          description: milestone.description,
          icon: milestone.icon,
          earnedAt: new Date(),
        };
        
        newBadges.push(badge);
        
        // Add milestone bonus points
        volunteer.points += milestone.points;
        
        console.log(`🎉 Badge earned: ${milestone.name} by volunteer ${volunteer.fullName}`);
      }
    }

    // Add new badges to volunteer
    if (newBadges.length > 0) {
      volunteer.badges.push(...newBadges);
      
      // Send notification for new badges
      try {
        await sendNotification({
          userId: volunteer._id,
          userModel: "Volunteer",
          email: volunteer.email,
          title: "New Badge Earned!",
          message: `Congratulations! You earned the "${newBadges[0].name}" badge. ${newBadges[0].description}`,
          type: "system",
          channel: "both",
          link: "/volunteer/badges",
        });
      } catch (notifErr) {
        console.error("Failed to send badge notification:", notifErr);
      }
    }

    await volunteer.save();
    console.log(`Rewards awarded to ${volunteer.fullName}: +${totalPoints} points, ${newBadges.length} new badges`);
    
    return newBadges;
  } catch (error) {
    console.error("❌ Error awarding volunteer rewards:", error);
    return [];
  }
};

/**
 * Get volunteer's current level based on points
 */
export const getVolunteerLevel = (points) => {
  if (points >= 800) return { level: "Legend", color: "purple", icon: "🌟" };
  if (points >= 500) return { level: "Master", color: "gold", icon: "👑" };
  if (points >= 600) return { level: "Champion", color: "blue", icon: "🏆" };
  if (points >= 400) return { level: "Hero", color: "green", icon: "🏅" };
  if (points >= 200) return { level: "Helper", color: "orange", icon: "💪" };
  return { level: "Beginner", color: "gray", icon: "✨" };
};

/**
 * Calculate next milestone progress
 */
export const getNextMilestone = (completedTasks) => {
  const milestones = [1, 2, 3, 4, 5, 6, 7, 8];
  const nextMilestone = milestones.find(milestone => milestone > completedTasks);
  
  if (!nextMilestone) {
    return { next: null, progress: 100, message: "You've reached the highest milestone!" };
  }
  
  const progress = Math.round((completedTasks / nextMilestone) * 100);
  return {
    next: nextMilestone,
    progress: Math.min(progress, 100),
    message: `${nextMilestone - completedTasks} more tasks to reach the next milestone!`
  };
};
