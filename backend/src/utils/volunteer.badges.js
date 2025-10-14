import Volunteer from "../models/Volunteer.js";

/**
 * Award points and badges to a volunteer based on completed tasks.
 * Returns the list of newly earned badges (if any).
 */
export const awardVolunteerRewards = async (volunteerId) => {
  const volunteer = await Volunteer.findById(volunteerId);
  if (!volunteer) return [];

  // Add base reward points
  volunteer.points = (volunteer.points || 0) + 20;
  volunteer.completedTasks = (volunteer.completedTasks || 0) + 1;

  const taskCount = volunteer.completedTasks;
  const existingBadges = volunteer.badges?.map((b) => b.name) || [];
  const newBadges = [];

  // Updated Milestones
  const milestones = [
    {
      count: 1,
      name: "First Step",
      description: "Completed your first volunteering task!",
      icon: "✨",
    },
    {
      count: 2,
      name: "Active Helper",
      description: "Completed 2 volunteering tasks — consistency matters!",
      icon: "💪",
    },
    {
      count: 3,
      name: "Helping Hand",
      description: "Completed 3 volunteering tasks — you're making an impact!",
      icon: "🖐️",
    },
    {
      count: 4,
      name: "Community Hero",
      description: "Completed 4 volunteering tasks — outstanding dedication!",
      icon: "🏅",
    },
    {
      count: 5,
      name: "Neighborhood Legend",
      description: "Completed 5 volunteering tasks — your passion inspires others!",
      icon: "🔥",
    },
    {
      count: 6,
      name: "Volunteer Champion",
      description: "Completed 6 volunteering tasks — a true force for good!",
      icon: "🏆",
    },
  ];

  // Check if volunteer just hit a milestone
  for (const milestone of milestones) {
    if (
      taskCount === milestone.count &&
      !existingBadges.includes(milestone.name)
    ) {
      newBadges.push({
        name: milestone.name,
        description: milestone.description,
        icon: milestone.icon,
      });
    }
  }

  if (newBadges.length > 0) {
    volunteer.badges.push(...newBadges);
  }

  await volunteer.save();
  return newBadges;
};
