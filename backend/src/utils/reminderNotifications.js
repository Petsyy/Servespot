// src/utils/reminderNotifications.js
import Opportunity from "../models/Opportunity.js";
import Volunteer from "../models/Volunteer.js";
import Organization from "../models/Organization.js";
import { sendNotification } from "./sendNotification.js";

/**
 * Send reminder notifications for opportunities happening tomorrow
 * This function should be called daily via cron job or scheduler
 */
export const sendUpcomingOpportunityReminders = async () => {
  try {
    console.log("🔔 Starting upcoming opportunity reminders...");
    
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    
    // Find opportunities happening tomorrow
    const upcomingOpportunities = await Opportunity.find({
      date: {
        $gte: tomorrow,
        $lt: dayAfter
      },
      status: { $in: ["Open", "In Progress"] }
    })
    .populate('organization')
    .populate('volunteers');

    console.log(`Found ${upcomingOpportunities.length} opportunities happening tomorrow`);

    for (const opportunity of upcomingOpportunities) {
      // Notify organization
      if (opportunity.organization) {
        await sendNotification({
          userId: opportunity.organization._id,
          userModel: "Organization",
          email: opportunity.organization.email,
          title: "Opportunity Reminder",
          message: `Your opportunity "${opportunity.title}" is scheduled for tomorrow (${opportunity.date?.toLocaleDateString()}).`,
          type: "reminder",
          channel: "both",
          link: `/organization/opportunities/${opportunity._id}`,
        });
      }

      // Notify all volunteers
      for (const volunteerId of opportunity.volunteers) {
        const volunteer = await Volunteer.findById(volunteerId);
        if (volunteer) {
          await sendNotification({
            userId: volunteer._id,
            userModel: "Volunteer",
            email: volunteer.email,
            title: "Opportunity Reminder",
            message: `Your volunteer opportunity "${opportunity.title}" by ${opportunity.organization?.orgName} is scheduled for tomorrow (${opportunity.date?.toLocaleDateString()}).`,
            type: "reminder",
            channel: "both",
            link: `/volunteer/opportunities/${opportunity._id}`,
          });
        }
      }
    }

    console.log("Upcoming opportunity reminders sent successfully");
    return { success: true, count: upcomingOpportunities.length };
  } catch (error) {
    console.error("❌ Error sending upcoming opportunity reminders:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Manual trigger for testing reminder notifications
 * Can be called via API endpoint for testing
 */
export const triggerReminderTest = async (opportunityId) => {
  try {
    const opportunity = await Opportunity.findById(opportunityId)
      .populate('organization')
      .populate('volunteers');

    if (!opportunity) {
      throw new Error("Opportunity not found");
    }

    // Notify organization
    if (opportunity.organization) {
      await sendNotification({
        userId: opportunity.organization._id,
        userModel: "Organization",
        email: opportunity.organization.email,
        title: "Test Reminder",
        message: `Test reminder for opportunity "${opportunity.title}" scheduled for ${opportunity.date?.toLocaleDateString()}.`,
        type: "reminder",
        channel: "both",
        link: `/organization/opportunities/${opportunity._id}`,
      });
    }

    // Notify volunteers
    for (const volunteerId of opportunity.volunteers) {
      const volunteer = await Volunteer.findById(volunteerId);
      if (volunteer) {
        await sendNotification({
          userId: volunteer._id,
          userModel: "Volunteer",
          email: volunteer.email,
          title: "Test Reminder",
          message: `Test reminder for opportunity "${opportunity.title}" by ${opportunity.organization?.orgName} scheduled for ${opportunity.date?.toLocaleDateString()}.`,
          type: "reminder",
          channel: "both",
          link: `/volunteer/opportunities/${opportunity._id}`,
        });
      }
    }

    return { success: true, message: "Test reminders sent successfully" };
  } catch (error) {
    console.error("❌ Error sending test reminders:", error);
    return { success: false, error: error.message };
  }
};
