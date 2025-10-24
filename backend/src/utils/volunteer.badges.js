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
        count: 3,
        name: "Active Helper",
        description: "Completed 3 volunteering tasks — consistency matters!",
        icon: "💪",
        points: 30,
      },
      {
        count: 5,
        name: "Helping Hand",
        description: "Completed 5 volunteering tasks — you're making an impact!",
        icon: "🖐️",
        points: 50,
      },
      {
        count: 10,
        name: "Community Hero",
        description: "Completed 10 volunteering tasks — outstanding dedication!",
        icon: "🏅",
        points: 100,
      },
      {
        count: 15,
        name: "Neighborhood Legend",
        description: "Completed 15 volunteering tasks — your passion inspires others!",
        icon: "🔥",
        points: 150,
      },
      {
        count: 25,
        name: "Volunteer Champion",
        description: "Completed 25 volunteering tasks — a true force for good!",
        icon: "🏆",
        points: 250,
      },
      {
        count: 50,
        name: "Volunteer Master",
        description: "Completed 50 volunteering tasks — you're a legend!",
        icon: "👑",
        points: 500,
      },
      {
        count: 100,
        name: "Volunteer Legend",
        description: "Completed 100 volunteering tasks — you're an inspiration!",
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
    console.log(`✅ Rewards awarded to ${volunteer.fullName}: +${totalPoints} points, ${newBadges.length} new badges`);
    
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
  if (points >= 1000) return { level: "Legend", color: "purple", icon: "🌟" };
  if (points >= 500) return { level: "Master", color: "gold", icon: "👑" };
  if (points >= 250) return { level: "Champion", color: "blue", icon: "🏆" };
  if (points >= 100) return { level: "Hero", color: "green", icon: "🏅" };
  if (points >= 50) return { level: "Helper", color: "orange", icon: "💪" };
  return { level: "Beginner", color: "gray", icon: "✨" };
};

/**
 * Calculate next milestone progress
 */
export const getNextMilestone = (completedTasks) => {
  const milestones = [1, 3, 5, 10, 15, 25, 50, 100];
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
