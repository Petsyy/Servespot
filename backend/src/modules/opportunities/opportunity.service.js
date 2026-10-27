import { opportunityRepository } from "./opportunity.repository.js";
import Opportunity from "./opportunity.model.js";
import Organization from "../organizations/organization.model.js";
import Volunteer from "../volunteers/volunteer.model.js";
import Notification from "../notifications/notification.model.js";
import Admin from "../admin/admin.model.js";
import mongoose from "mongoose";
import { awardVolunteerRewards } from "../../utils/volunteer.badges.js";
import { sendNotification } from "../../utils/sendNotification.js";
import {
  deleteCloudinaryFile,
  uploadFileToCloudinary,
} from "../../utils/cloudinaryUpload.js";

export class OpportunityService {
  constructor({
    opportunities = opportunityRepository,
    organizations = Organization,
    volunteers = Volunteer,
    notifications = Notification,
    admins = Admin,
  } = {}) {
    this.opportunities = opportunities;
    this.organizations = organizations;
    this.volunteers = volunteers;
    this.notifications = notifications;
    this.admins = admins;
  }

  async listForOrganization(orgId) {
    return this.opportunities.forOrganization(orgId);
  }

  async listActive() {
    return this.opportunities.active();
  }

  async getById(id) {
    if (!mongoose.isValidObjectId(id)) {
      const err = new Error("Invalid opportunity ID");
      err.status = 400;
      throw err;
    }
    const opportunity = await this.opportunities.findByIdWithDetails(id);
    if (!opportunity) {
      const err = new Error("Opportunity not found");
      err.status = 404;
      throw err;
    }
    return opportunity;
  }

  async createOpportunity({ data, file }) {
    const {
      title,
      description,
      date,
      duration,
      location,
      volunteersNeeded,
      organization,
    } = data;

    if (!organization || organization === "undefined") {
      const err = new Error("Missing or invalid organization ID");
      err.status = 400;
      throw err;
    }

    let skills = data.skills || data["skills[]"] || [];
    if (!Array.isArray(skills)) skills = [skills];

    const uploadedFile = file
      ? await uploadFileToCloudinary(file, "servespot/opportunities")
      : null;

    const opportunity = new Opportunity({
      title,
      description,
      date: date ? new Date(date) : null,
      duration,
      location,
      volunteersNeeded: Number(volunteersNeeded) || 1,
      organization,
      skills,
      fileUrl: uploadedFile?.url || "",
      filePublicId: uploadedFile?.publicId || "",
      fileResourceType: uploadedFile?.resourceType || "",
      status: "Open",
      volunteers: [],
    });

    await opportunity.save();

    // Trigger non-blocking notifications in background
    process.nextTick(async () => {
      try {
        const org = await this.organizations.findById(organization);
        const matchingVolunteers = await this.volunteers
          .find({
            $or: [{ city: org?.city }, { skills: { $in: opportunity.skills } }],
            status: "active",
          })
          .select("_id email")
          .limit(10);

        await Promise.all(
          matchingVolunteers.map((vol) =>
            sendNotification({
              userId: vol._id,
              userModel: "Volunteer",
              email: vol.email,
              title: "New Opportunity Available",
              message: `"${opportunity.title}" by ${org?.orgName || "an organization"} is now open in ${opportunity.location || org?.city}.`,
              type: "update",
              channel: "both",
              link: `/volunteer/opportunities/${opportunity._id}`,
            })
          )
        );
      } catch (notifErr) {
        console.error(" Background create notification error:", notifErr);
      }
    });

    return opportunity;
  }

  async updateOpportunity(id, { data, file }) {
    const { title, description, date, duration, location, volunteersNeeded } = data;

    const opportunity = await Opportunity.findById(id);
    if (!opportunity) {
      const err = new Error("Opportunity not found");
      err.status = 404;
      throw err;
    }

    // Update core fields
    opportunity.title = title || opportunity.title;
    opportunity.description = description || opportunity.description;
    opportunity.date = date ? new Date(date) : opportunity.date;
    opportunity.duration = duration || opportunity.duration;
    opportunity.location = location || opportunity.location;
    opportunity.volunteersNeeded =
      Number(volunteersNeeded) || opportunity.volunteersNeeded;

    let skills = data.skills || data["skills[]"] || [];
    if (!Array.isArray(skills)) skills = [skills];
    opportunity.skills = skills;

    if (file) {
      const uploadedFile = await uploadFileToCloudinary(
        file,
        "servespot/opportunities"
      );

      await deleteCloudinaryFile(
        opportunity.filePublicId,
        opportunity.fileResourceType
      );

      opportunity.fileUrl = uploadedFile?.url || "";
      opportunity.filePublicId = uploadedFile?.publicId || "";
      opportunity.fileResourceType = uploadedFile?.resourceType || "";
    }

    await opportunity.save();

    // Background notifications
    process.nextTick(async () => {
      try {
        const org = await this.organizations.findById(opportunity.organization);
        const activeAdmins = await this.admins.find({ status: "active" }).select("_id");

        await Promise.all(
          activeAdmins.map((admin) =>
            sendNotification({
              userId: admin._id,
              userModel: "Admin",
              title: "Opportunity Updated",
              message: `${org?.orgName || "An organization"} updated "${opportunity.title}".`,
              type: "opportunity_updated",
              channel: "inApp",
              link: "/admin/reports",
            })
          )
        );

        const joinedVolunteers = await this.volunteers
          .find({ _id: { $in: opportunity.volunteers } })
          .select("_id email")
          .limit(20);

        await Promise.all(
          joinedVolunteers.map((vol) =>
            sendNotification({
              userId: vol._id,
              userModel: "Volunteer",
              email: vol.email,
              title: "Opportunity Updated",
              message: `Details for "${opportunity.title}" have been updated by ${org?.orgName || "the organization"}.`,
              type: "update",
              channel: "both",
              link: `/volunteer/opportunities/${opportunity._id}`,
            })
          )
        );
      } catch (notifErr) {
        console.error("⚠️ Background update notification error:", notifErr);
      }
    });

    return opportunity;
  }

  async volunteerSignup(opportunityId, volunteerId) {
    if (!volunteerId) {
      const err = new Error("Invalid volunteer token or ID");
      err.status = 400;
      throw err;
    }

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      const err = new Error("Opportunity not found");
      err.status = 404;
      throw err;
    }

    if (["Closed", "Completed"].includes(opportunity.status)) {
      const err = new Error("This opportunity is no longer open for sign-ups.");
      err.status = 400;
      throw err;
    }

    if (
      opportunity.volunteers.length >= opportunity.volunteersNeeded &&
      opportunity.volunteersNeeded > 0
    ) {
      const err = new Error("This opportunity is already full.");
      err.status = 400;
      throw err;
    }

    if (opportunity.volunteers.includes(volunteerId)) {
      const err = new Error("You have already joined this opportunity.");
      err.status = 400;
      throw err;
    }

    opportunity.volunteers.push(volunteerId);

    if (opportunity.volunteers.length >= opportunity.volunteersNeeded) {
      opportunity.status = "In Progress";
    }

    await opportunity.save();

    // Notify organization
    try {
      const oppWithOrg = await Opportunity.findById(opportunityId).populate("organization");
      const vol = await this.volunteers.findById(volunteerId);

      if (oppWithOrg?.organization && vol) {
        const existingNotification = await this.notifications.findOne({
          user: oppWithOrg.organization._id,
          userModel: "Organization",
          title: "New Volunteer Application",
          message: `${vol.fullName} applied for "${opportunity.title}".`,
        });

        if (!existingNotification) {
          await sendNotification({
            userId: oppWithOrg.organization._id,
            userModel: "Organization",
            email: oppWithOrg.organization.email,
            title: "New Volunteer Application",
            message: `${vol.fullName} applied for "${opportunity.title}".`,
            type: "update",
            channel: "both",
            link: `/organization/opportunities/${opportunityId}`,
          });
        }
      }
    } catch (notifErr) {
      console.error("Failed to send volunteer application notification:", notifErr);
    }

    return {
      currentVolunteers: opportunity.volunteers.length,
      volunteersNeeded: opportunity.volunteersNeeded,
      opportunityStatus: opportunity.status,
    };
  }

  async markOpportunityCompleted(id) {
    const opportunity = await this.opportunities.findByIdPopulated(id);
    if (!opportunity) {
      const err = new Error("Opportunity not found");
      err.status = 404;
      throw err;
    }

    const approvedProofs = opportunity.completionProofs.filter(
      (p) => p.status === "Approved"
    );
    if (approvedProofs.length === 0) {
      const err = new Error("No approved proofs. Cannot complete opportunity.");
      err.status = 400;
      throw err;
    }

    opportunity.status = "Completed";
    opportunity.completedVolunteers = approvedProofs.map(
      (p) => p.volunteer._id || p.volunteer.toString()
    );

    const allNewBadges = [];

    for (const proof of approvedProofs) {
      const volunteerId = proof.volunteer._id || proof.volunteer;
      const newBadges = await awardVolunteerRewards(volunteerId);
      if (newBadges?.length > 0) {
        allNewBadges.push({ volunteerId, badges: newBadges });
      }

      await sendNotification({
        userId: volunteerId,
        userModel: "Volunteer",
        title: "Opportunity Completed",
        message: `The opportunity "${opportunity.title}" has been marked as completed by the organization.`,
        type: "completion",
        channel: "both",
        email: proof.volunteer.email,
      });
    }

    await opportunity.save();

    return {
      completedCount: approvedProofs.length,
      status: "Completed",
      newBadges: allNewBadges,
    };
  }

  async getStats(orgId) {
    const opportunities = await this.opportunities.findForStats(orgId);
    const totalOpportunities = opportunities.length;

    const allVolunteers = new Set();
    opportunities.forEach((opp) => {
      if (opp.volunteers) {
        opp.volunteers.forEach((vol) => allVolunteers.add(vol._id.toString()));
      }
    });
    const totalVolunteers = allVolunteers.size;

    const completedOpportunities = opportunities.filter(
      (opp) => opp.status === "Completed" || opp.completedVolunteers?.length > 0
    );
    const totalHours = completedOpportunities.length * 4;

    const completionRate =
      totalOpportunities > 0
        ? Math.round((completedOpportunities.length / totalOpportunities) * 100)
        : 0;

    return {
      totalOpportunities,
      totalVolunteers,
      totalHours,
      completionRate,
      total: totalOpportunities,
      active: opportunities.filter((opp) => opp.status === "Open").length,
      inProgress: opportunities.filter((opp) => opp.status === "In Progress").length,
      completedTasks: completedOpportunities.length,
      engagedVolunteers: totalVolunteers,
    };
  }

  async getOpportunityVolunteers(id) {
    const opportunity = await this.opportunities.findWithVolunteers(id);
    if (!opportunity) {
      const err = new Error("Opportunity not found");
      err.status = 404;
      throw err;
    }

    const volunteers = (opportunity.volunteers || []).map((vol) => ({
      ...vol,
      status: opportunity.completedVolunteers?.some(
        (cv) => cv.toString() === vol._id.toString()
      )
        ? "Completed"
        : "Joined",
    }));

    return {
      title: opportunity.title,
      totalVolunteers: volunteers.length,
      volunteers,
    };
  }

  async confirmVolunteerCompletion(oppId, volunteerId) {
    if (!oppId || !volunteerId) {
      const err = new Error("Missing required IDs");
      err.status = 400;
      throw err;
    }

    const opportunity = await Opportunity.findById(oppId);
    if (!opportunity) {
      const err = new Error("Opportunity not found");
      err.status = 404;
      throw err;
    }

    const isVolunteer = opportunity.volunteers.some(
      (v) => v.toString() === volunteerId
    );
    if (!isVolunteer) {
      const err = new Error("This volunteer did not join this opportunity.");
      err.status = 400;
      throw err;
    }

    if (!Array.isArray(opportunity.completedVolunteers)) {
      opportunity.completedVolunteers = [];
    }

    const alreadyCompleted = opportunity.completedVolunteers.some(
      (v) => v.toString() === volunteerId
    );
    if (alreadyCompleted) {
      return {
        alreadyCompleted: true,
        opportunityStatus: opportunity.status,
      };
    }

    opportunity.completedVolunteers.push(volunteerId);

    const total = opportunity.volunteers.length;
    const completed = opportunity.completedVolunteers.length;
    opportunity.status = completed >= total ? "Closed" : "In Progress";

    await opportunity.save();

    // Background notifications
    process.nextTick(async () => {
      try {
        const vol = await this.volunteers.findById(volunteerId);
        const org = await this.organizations.findById(opportunity.organization);

        if (vol && org) {
          await sendNotification({
            userId: vol._id,
            userModel: "Volunteer",
            email: vol.email,
            title: "Volunteer Completion Confirmed",
            message: `Your completion for "${opportunity.title}" by ${org.orgName} has been confirmed.`,
            type: "completion",
            channel: "both",
            link: `/volunteer/opportunities/${oppId}`,
          });
        }

        const activeAdmins = await this.admins.find({ status: "active" });
        await Promise.all(
          activeAdmins.map((admin) =>
            sendNotification({
              userId: admin._id,
              userModel: "Admin",
              title: "Volunteer completed an opportunity",
              message: `Volunteer ${vol?.fullName || volunteerId} completed ${opportunity.title}.`,
              type: "volunteer_completion",
              channel: "inApp",
              link: "/admin/reports",
            })
          )
        );
      } catch (notifErr) {
        console.error(" Background completion notification error:", notifErr);
      }
    });

    return {
      volunteerId,
      completedCount: completed,
      totalVolunteers: total,
      opportunityStatus: opportunity.status,
    };
  }

  async submitCompletionProof(id, volunteerId, { message, file }) {
    const uploadedFile = file
      ? await uploadFileToCloudinary(file, "servespot/completion-proofs")
      : null;
    const fileUrl = uploadedFile?.url || "";

    const opportunity = await Opportunity.findById(id);
    if (!opportunity) {
      const err = new Error("Opportunity not found");
      err.status = 404;
      throw err;
    }

    if (!opportunity.volunteers.includes(volunteerId)) {
      const err = new Error("You must join this opportunity before submitting a proof.");
      err.status = 400;
      throw err;
    }

    const existingProof = opportunity.completionProofs.find(
      (p) => p.volunteer.toString() === volunteerId
    );

    if (existingProof && existingProof.status !== "Rejected") {
      const err = new Error("You already submitted a proof for this task.");
      err.status = 400;
      throw err;
    }

    if (existingProof && existingProof.status === "Rejected") {
      await deleteCloudinaryFile(
        existingProof.filePublicId,
        existingProof.fileResourceType
      );
      opportunity.completionProofs = opportunity.completionProofs.filter(
        (p) => p.volunteer.toString() !== volunteerId
      );
    }

    opportunity.completionProofs.push({
      volunteer: volunteerId,
      message,
      fileUrl,
      filePublicId: uploadedFile?.publicId || "",
      fileResourceType: uploadedFile?.resourceType || "",
      status: "Pending",
    });

    await opportunity.save();

    return { volunteerId, fileUrl, message };
  }

  async reviewCompletionProof(id, volunteerId, action) {
    const opportunity = await Opportunity.findById(id);
    if (!opportunity) {
      const err = new Error("Opportunity not found");
      err.status = 404;
      throw err;
    }

    const proof = opportunity.completionProofs.find(
      (p) => p.volunteer.toString() === volunteerId
    );

    if (!proof) {
      const err = new Error("Proof not found for this volunteer");
      err.status = 404;
      throw err;
    }

    if (action === "approve") {
      proof.status = "Approved";
      if (!opportunity.completedVolunteers.includes(volunteerId)) {
        opportunity.completedVolunteers.push(volunteerId);
      }
    } else if (action === "reject") {
      proof.status = "Rejected";
      proof.rejectedAt = new Date();
      opportunity.completedVolunteers = opportunity.completedVolunteers.filter(
        (v) => v.toString() !== volunteerId
      );
    }

    const total = opportunity.volunteers.length;
    const approvedCount = opportunity.completionProofs.filter(
      (p) => p.status === "Approved"
    ).length;

    opportunity.status = "In Progress";
    await opportunity.save();

    // Background notification to volunteer
    process.nextTick(async () => {
      try {
        const vol = await this.volunteers.findById(volunteerId);
        const org = await this.organizations.findById(opportunity.organization);

        if (vol && org) {
          await sendNotification({
            userId: vol._id,
            userModel: "Volunteer",
            email: vol.email,
            title: action === "approve" ? "Proof Approved" : "Proof Rejected",
            message:
              action === "approve"
                ? `Your proof for "${opportunity.title}" by ${org.orgName} has been approved.`
                : `Your proof for "${opportunity.title}" by ${org.orgName} was rejected. You can submit a new proof.`,
            type: action === "approve" ? "completion" : "update",
            channel: "both",
            link: `/volunteer/opportunities/${id}`,
          });
        }
      } catch (notifErr) {
        console.error("Failed to send proof review notification:", notifErr);
      }
    });

    return {
      message:
        action === "approve"
          ? "Volunteer proof approved and marked as completed."
          : "Volunteer proof rejected. Volunteer can submit a new proof.",
      opportunityStatus: opportunity.status,
      approvedCount,
      total,
    };
  }

  async forceCompleteOpportunity(id) {
    const opp = await Opportunity.findById(id);
    if (!opp) {
      const err = new Error("Opportunity not found");
      err.status = 404;
      throw err;
    }

    opp.status = "Completed";
    opp.forcedComplete = true;
    await opp.save();
    return opp;
  }

  async deleteOpportunity(id) {
    return this.opportunities.deleteById(id);
  }

  async getOrgNotifications(orgId) {
    return this.notifications
      .find({ user: orgId, userModel: "Organization" })
      .sort({ createdAt: -1 })
      .lean();
  }
}

export const opportunityService = new OpportunityService();
