import Opportunity from "../models/Opportunity.js";
import Organization from "../models/Organization.js";
import Volunteer from "../models/Volunteer.js";
import Notification from "../models/Notification.js";
import Admin from "../models/Admin.js";
import { awardVolunteerRewards } from "../utils/volunteer.badges.js";
import { sendNotification } from "../utils/sendNotification.js";

// Fetch all opportunities for an organization
export const getOpportunities = async (req, res) => {
  try {
    const { orgId } = req.params;
    const opportunities = await Opportunity.find({ organization: orgId });
    res.json(opportunities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching opportunities" });
  }
};

// Create a new opportunity with file upload (optimized version)
export const createOpportunity = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      duration,
      location,
      volunteersNeeded,
      organization,
    } = req.body;

    if (!organization || organization === "undefined") {
      return res
        .status(400)
        .json({ message: "Missing or invalid organization ID" });
    }

    let skills = req.body.skills || req.body["skills[]"] || [];
    if (!Array.isArray(skills)) skills = [skills];

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const opportunity = new Opportunity({
      title,
      description,
      date: date ? new Date(date) : null,
      duration,
      location,
      volunteersNeeded: Number(volunteersNeeded) || 1,
      organization,
      skills,
      fileUrl,
      status: "Open",
      volunteers: [],
    });

    // Save opportunity first (fast)
    await opportunity.save();
    console.log("✅ Opportunity saved for org:", organization);

    // Respond to frontend immediately (non-blocking)
    res.status(201).json({
      message: "Opportunity created successfully!",
      opportunity,
    });

    // Do background tasks AFTER response
    process.nextTick(async () => {
      try {
        const org = await Organization.findById(organization);

        // Notify volunteers (parallel)
        const volunteers = await Volunteer.find({
          $or: [{ city: org.city }, { skills: { $in: opportunity.skills } }],
          status: "active",
        })
          .select("_id email")
          .limit(10);

        await Promise.all(
          volunteers.map((vol) =>
            sendNotification({
              userId: vol._id,
              userModel: "Volunteer",
              email: vol.email,
              title: "New Opportunity Available",
              message: `"${opportunity.title}" by ${org.orgName} is now open in ${opportunity.location || org.city}.`,
              type: "update",
              channel: "both",
              link: `/volunteer/opportunities/${opportunity._id}`,
            })
          )
        );

        // Notify admins (parallel)
        const admins = await Admin.find({ status: "active" }).select("_id");
        await Promise.all(
          admins.map((admin) =>
            sendNotification({
              userId: admin._id,
              userModel: "Admin",
              title: "New opportunity posted",
              message: `${org?.orgName || "An organization"} created a new opportunity: ${opportunity.title}.`,
              type: "opportunity_posted",
              channel: "inApp",
              link: "/admin/reports",
            })
          )
        );
      } catch (notifErr) {
        console.error("⚠️ Background notification error:", notifErr.message);
      }
    });
  } catch (err) {
    console.error("❌ Error creating opportunity:", err);
    res.status(500).json({
      message: "Error creating opportunity",
      error: err.message,
    });
  }
};

export const updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, duration, location, volunteersNeeded } =
      req.body;

    const opportunity = await Opportunity.findById(id);
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    // Update core fields
    opportunity.title = title || opportunity.title;
    opportunity.description = description || opportunity.description;
    opportunity.date = date ? new Date(date) : opportunity.date;
    opportunity.duration = duration || opportunity.duration;
    opportunity.location = location || opportunity.location;
    opportunity.volunteersNeeded =
      Number(volunteersNeeded) || opportunity.volunteersNeeded;

    // Update skills
    let skills = req.body.skills || req.body["skills[]"] || [];
    if (!Array.isArray(skills)) skills = [skills];
    opportunity.skills = skills;

    // If new file uploaded
    if (req.file) {
      const fs = await import("fs");
      if (opportunity.fileUrl && fs.existsSync(`.${opportunity.fileUrl}`)) {
        fs.unlinkSync(`.${opportunity.fileUrl}`);
      }
      opportunity.fileUrl = `/uploads/${req.file.filename}`;
    }

    // Save first — return success fast
    await opportunity.save();

    res.status(200).json({
      message: "Opportunity updated successfully!",
      opportunity,
    });

    // Background notifications (non-blocking)
    process.nextTick(async () => {
      try {
        const org = await Organization.findById(opportunity.organization);
        const admins = await Admin.find({ status: "active" }).select("_id");

        // Notify admins in parallel
        await Promise.all(
          admins.map((admin) =>
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

        // Optional: Notify volunteers currently joined in parallel
        const joinedVolunteers = await Volunteer.find({
          _id: { $in: opportunity.volunteers },
        })
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
  } catch (err) {
    console.error("❌ Error updating opportunity:", err);
    res.status(500).json({ message: "Failed to update opportunity" });
  }
};

// Volunteer signs up for an opportunity
export const volunteerSignup = async (req, res) => {
  try {
    const volunteerId = req.user?.id;
    const opportunityId = req.params.id;

    console.log("Volunteer Signup:", { volunteerId, opportunityId });

    if (!volunteerId) {
      return res.status(400).json({ message: "Invalid volunteer token or ID" });
    }

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    // Block if closed or completed
    if (["Closed", "Completed"].includes(opportunity.status)) {
      return res
        .status(400)
        .json({ message: "This opportunity is no longer open for sign-ups." });
    }

    // Block if already full
    if (
      opportunity.volunteers.length >= opportunity.volunteersNeeded &&
      opportunity.volunteersNeeded > 0
    ) {
      return res
        .status(400)
        .json({ message: "This opportunity is already full." });
    }

    // Prevent duplicate joins
    if (opportunity.volunteers.includes(volunteerId)) {
      return res
        .status(400)
        .json({ message: "You have already joined this opportunity." });
    }

    // Add volunteer
    opportunity.volunteers.push(volunteerId);

    // If full after adding → mark as In Progress
    if (opportunity.volunteers.length >= opportunity.volunteersNeeded) {
      opportunity.status = "In Progress";
    }

    await opportunity.save();

    console.log("Volunteer added:", volunteerId, "→", opportunity.title);

    // Notify organization about new volunteer application
    try {
      const opportunityWithOrg =
        await Opportunity.findById(opportunityId).populate("organization");
      const volunteer = await Volunteer.findById(volunteerId);

      if (opportunityWithOrg?.organization && volunteer) {
        await sendNotification({
          userId: opportunityWithOrg.organization._id,
          userModel: "Organization",
          email: opportunityWithOrg.organization.email,
          title: "New Volunteer Application",
          message: `${volunteer.fullName} applied for "${opportunity.title}".`,
          type: "update",
          channel: "both",
          link: `/organization/opportunities/${opportunityId}`,
        });
      }
    } catch (notifErr) {
      console.error(
        "Failed to send volunteer application notification:",
        notifErr
      );
      // Don't fail the main request if notification fails
    }

    res.status(200).json({
      message: "Successfully joined the opportunity!",
      currentVolunteers: opportunity.volunteers.length,
      volunteersNeeded: opportunity.volunteersNeeded,
      opportunityStatus: opportunity.status,
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({
      message: "Server error during volunteer signup",
      error: err.message,
    });
  }
};

export const getAllOpportunities = async (req, res) => {
  try {
    const userId = req.user?.id; // optional if logged in

    // Show only opportunities that are NOT completed or closed
    const filter = { status: { $nin: ["Completed", "Closed"] } };

    const opportunities = await Opportunity.find(filter)
      .populate("organization", "orgName") // Only get orgName field
      .select(
        "title description organization location date duration volunteersNeeded volunteers skills status fileUrl points"
      )
      .sort({ createdAt: -1 });

    res.status(200).json(opportunities);
  } catch (err) {
    console.error("Error fetching uncompleted opportunities:", err);
    res
      .status(500)
      .json({ message: "Failed to load opportunities", error: err.message });
  }
};

export const markOpportunityCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await Opportunity.findById(id)
      .populate("completionProofs.volunteer")
      .populate("volunteers");

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    // Must have approved proofs
    const approvedProofs = opportunity.completionProofs.filter(
      (p) => p.status === "Approved"
    );
    if (approvedProofs.length === 0) {
      return res.status(400).json({
        message: "No approved proofs. Cannot complete opportunity.",
      });
    }

    // Mark opportunity completed
    opportunity.status = "Completed";
    opportunity.completedVolunteers = approvedProofs.map(
      (p) => p.volunteer._id || p.volunteer.toString()
    );

    const allNewBadges = [];

    // Award each volunteer (points + badge milestones)
    for (const proof of approvedProofs) {
      const volunteerId = proof.volunteer._id || proof.volunteer;
      const newBadges = await awardVolunteerRewards(volunteerId);

      if (newBadges.length > 0) {
        allNewBadges.push({ volunteerId, badges: newBadges });
      }
    }

    await opportunity.save();

    res.status(200).json({
      message: `Opportunity marked as completed. ${approvedProofs.length} volunteer(s) rewarded.`,
      completedCount: approvedProofs.length,
      status: "Completed",
      newBadges: allNewBadges,
    });
  } catch (err) {
    console.error("❌ Error marking opportunity completed:", err);
    res.status(500).json({
      message: "Failed to mark opportunity completed",
      error: err.message,
    });
  }
};

export const getStats = async (req, res) => {
  try {
    const { orgId } = req.params;

    // Get all opportunities for this organization
    const opportunities = await Opportunity.find({ organization: orgId })
      .populate("volunteers", "_id")
      .populate("completedVolunteers", "_id")
      .lean();

    // Calculate total opportunities created
    const totalOpportunities = opportunities.length;

    // Calculate total volunteers recruited (unique volunteers across all opportunities)
    const allVolunteers = new Set();
    opportunities.forEach((opp) => {
      if (opp.volunteers) {
        opp.volunteers.forEach((vol) => allVolunteers.add(vol._id.toString()));
      }
    });
    const totalVolunteers = allVolunteers.size;

    // Calculate total hours (estimate based on completed opportunities)
    const completedOpportunities = opportunities.filter(
      (opp) => opp.status === "Completed" || opp.completedVolunteers?.length > 0
    );
    const totalHours = completedOpportunities.length * 4; // Estimate 4 hours per completed opportunity

    // Calculate completion rate
    const completionRate =
      totalOpportunities > 0
        ? Math.round((completedOpportunities.length / totalOpportunities) * 100)
        : 0;

    res.json({
      totalOpportunities,
      totalVolunteers,
      totalHours,
      completionRate,
      // Keep legacy fields for backward compatibility
      total: totalOpportunities,
      active: opportunities.filter((opp) => opp.status === "Open").length,
      inProgress: opportunities.filter((opp) => opp.status === "In Progress")
        .length,
      completedTasks: completedOpportunities.length,
      engagedVolunteers: totalVolunteers,
    });
  } catch (err) {
    console.error("Error fetching organization stats:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// Get all volunteers who signed up for a specific opportunity
export const getOpportunityVolunteers = async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await Opportunity.findById(id)
      .populate(
        "volunteers",
        "firstName lastName fullName email city skills interests availability"
      )
      .lean();

    if (!opportunity)
      return res.status(404).json({ message: "Opportunity not found" });

    const volunteers = (opportunity.volunteers || []).map((vol) => ({
      ...vol,
      status: opportunity.completedVolunteers?.some(
        (cv) => cv.toString() === vol._id.toString()
      )
        ? "Completed"
        : "Joined",
    }));

    res.status(200).json({
      title: opportunity.title,
      totalVolunteers: volunteers.length,
      volunteers,
    });
  } catch (err) {
    console.error("Error fetching volunteers for opportunity:", err);
    res.status(500).json({ message: "Failed to load volunteers" });
  }
};

// ✅ Get specific opportunity by ID (for volunteer view modal)
export const getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await Opportunity.findById(id)
      .populate("organization", "orgName email")
      .populate("completionProofs.volunteer", "fullName email")
      .lean();

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    return res.status(200).json(opportunity);
  } catch (err) {
    console.error("❌ Error fetching opportunity by ID:", err);
    return res.status(500).json({
      message: "Failed to load opportunity details",
      error: err.message,
    });
  }
};

// Mark a volunteer as completed for a specific opportunity
export const confirmVolunteerCompletion = async (req, res) => {
  try {
    const { oppId, volunteerId } = req.params;

    // Validate IDs first
    if (!oppId || !volunteerId) {
      return res.status(400).json({ message: "Missing required IDs" });
    }

    const opportunity = await Opportunity.findById(oppId);
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    // Verify volunteer is part of the opportunity
    const isVolunteer = opportunity.volunteers.some(
      (v) => v.toString() === volunteerId
    );
    if (!isVolunteer) {
      return res.status(400).json({
        message: "This volunteer did not join this opportunity.",
      });
    }

    // Initialize completedVolunteers if missing
    if (!Array.isArray(opportunity.completedVolunteers)) {
      opportunity.completedVolunteers = [];
    }

    // Skip if already marked
    const alreadyCompleted = opportunity.completedVolunteers.some(
      (v) => v.toString() === volunteerId
    );
    if (alreadyCompleted) {
      return res.status(200).json({
        message: "Volunteer already marked as completed",
        status: opportunity.status,
      });
    }

    // Add volunteer to completed list
    opportunity.completedVolunteers.push(volunteerId);

    // Update status based on progress
    const total = opportunity.volunteers.length;
    const completed = opportunity.completedVolunteers.length;

    if (completed >= total) {
      opportunity.status = "Closed";
    } else {
      opportunity.status = "In Progress";
    }

    await opportunity.save();

    // Notify volunteer about completion confirmation
    try {
      const volunteer = await Volunteer.findById(volunteerId);
      const org = await Organization.findById(opportunity.organization);

      if (volunteer && org) {
        await sendNotification({
          userId: volunteer._id,
          userModel: "Volunteer",
          email: volunteer.email,
          title: "Volunteer Completion Confirmed",
          message: `Your completion for "${opportunity.title}" by ${org.orgName} has been confirmed.`,
          type: "completion",
          channel: "both",
          link: `/volunteer/opportunities/${oppId}`,
        });
      }
    } catch (notifErr) {
      console.error(
        "Failed to send completion confirmation notification:",
        notifErr
      );
      // Don't fail the main request if notification fails
    }

    // Notify admins that a volunteer completed an opportunity
    try {
      const volunteer = await Volunteer.findById(volunteerId);
      const admins = await Admin.find({ status: "active" });
      for (const admin of admins) {
        await sendNotification({
          userId: admin._id,
          userModel: "Admin",
          title: "Volunteer completed an opportunity",
          message: `Volunteer ${volunteer?.fullName || volunteerId} completed ${opportunity.title}.`,
          type: "volunteer_completion",
          channel: "inApp",
          link: "/admin/reports",
        });
      }
    } catch (e) {
      console.error("Failed to notify admins of volunteer completion:", e);
    }

    res.status(200).json({
      message: "Volunteer marked as completed",
      volunteerId,
      completedCount: completed,
      totalVolunteers: total,
      opportunityStatus: opportunity.status,
    });
  } catch (err) {
    console.error("Error confirming volunteer completion:", err);
    res.status(500).json({
      message: "Server error confirming completion",
      error: err.message,
    });
  }
};

export const submitCompletionProof = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteerId = req.user?.id;
    const { message } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const opportunity = await Opportunity.findById(id);
    if (!opportunity)
      return res.status(404).json({ message: "Opportunity not found" });

    // Ensure volunteer joined
    if (!opportunity.volunteers.includes(volunteerId)) {
      return res.status(400).json({
        message: "You must join this opportunity before submitting a proof.",
      });
    }

    // Check for existing submissions (allow resubmission if previous was rejected)
    const existingProof = opportunity.completionProofs.find(
      (p) => p.volunteer.toString() === volunteerId
    );

    if (existingProof && existingProof.status !== "Rejected") {
      return res
        .status(400)
        .json({ message: "You already submitted a proof for this task." });
    }

    // If there's a rejected proof, remove it before adding the new one
    if (existingProof && existingProof.status === "Rejected") {
      opportunity.completionProofs = opportunity.completionProofs.filter(
        (p) => p.volunteer.toString() !== volunteerId
      );
    }

    // Add proof entry
    opportunity.completionProofs.push({
      volunteer: volunteerId,
      message,
      fileUrl,
      status: "Pending",
    });

    await opportunity.save();

    res.status(201).json({
      message: "Proof submitted successfully. Awaiting organization review.",
      proof: { volunteerId, fileUrl, message },
    });
  } catch (err) {
    console.error("❌ Error submitting proof:", err);
    res
      .status(500)
      .json({ message: "Failed to submit proof", error: err.message });
  }
};

export const reviewCompletionProof = async (req, res) => {
  try {
    const { id, volunteerId } = req.params; // opportunity + volunteer
    const { action } = req.body; // "approve" or "reject"

    const opportunity = await Opportunity.findById(id);
    if (!opportunity)
      return res.status(404).json({ message: "Opportunity not found" });

    // Find the specific proof
    const proof = opportunity.completionProofs.find(
      (p) => p.volunteer.toString() === volunteerId
    );

    if (!proof)
      return res
        .status(404)
        .json({ message: "Proof not found for this volunteer" });

    if (action === "approve") {
      proof.status = "Approved";
      // Update completedVolunteers list
      if (!opportunity.completedVolunteers.includes(volunteerId)) {
        opportunity.completedVolunteers.push(volunteerId);
      }
    } else if (action === "reject") {
      // Mark as rejected but keep the proof entry for tracking
      proof.status = "Rejected";
      proof.rejectedAt = new Date();
      // Remove from completedVolunteers list
      opportunity.completedVolunteers = opportunity.completedVolunteers.filter(
        (v) => v.toString() !== volunteerId
      );
    }

    // Check total & approved proofs
    const total = opportunity.volunteers.length;
    const approvedCount = opportunity.completionProofs.filter(
      (p) => p.status === "Approved"
    ).length;

    // Do not auto-mark opportunity as completed
    // Always remain "In Progress" until org clicks Complete button
    opportunity.status = "In Progress";

    await opportunity.save();

    // Notify volunteer about proof approval/rejection
    try {
      const volunteer = await Volunteer.findById(volunteerId);
      const org = await Organization.findById(opportunity.organization);

      if (volunteer && org) {
        await sendNotification({
          userId: volunteer._id,
          userModel: "Volunteer",
          email: volunteer.email,
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
      // Don't fail the main request if notification fails
    }

    res.status(200).json({
      message:
        action === "approve"
          ? "Volunteer proof approved and marked as completed."
          : "Volunteer proof rejected. Volunteer can submit a new proof.",
      opportunityStatus: opportunity.status,
      approvedCount,
      total,
    });
  } catch (err) {
    console.error("❌ Error reviewing proof:", err);
    res
      .status(500)
      .json({ message: "Failed to review proof", error: err.message });
  }
};

export const forceCompleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const opp = await Opportunity.findById(id);
    if (!opp) return res.status(404).json({ message: "Opportunity not found" });

    opp.status = "Completed";
    opp.forcedComplete = true;

    await opp.save();
    res.json({ message: "Opportunity forcibly marked as completed." });
  } catch (err) {
    console.error("❌ Force complete error:", err);
    res.status(500).json({ message: "Failed to force complete opportunity" });
  }
};

export const submitProof = async (req, res) => {
  const { opportunityId } = req.params;
  const volunteerId = req.user.id;

  // Save proof logic here ...

  // After saving proof, send notifications
  const volunteer = await Volunteer.findById(volunteerId);
  const opportunity =
    await Opportunity.findById(opportunityId).populate("organization");

  // Notify organization
  await sendNotification({
    userId: opportunity.organization._id,
    userModel: "Organization",
    email: opportunity.organization.email,
    title: `Volunteer submitted proof`,
    message: `${volunteer.fullName} submitted proof for ${opportunity.title}.`,
    type: "update",
  });

  // Notify volunteer (confirmation)
  await sendNotification({
    userId: volunteer._id,
    userModel: "Volunteer",
    email: volunteer.email,
    title: `Proof submitted successfully`,
    message: `You successfully submitted proof for ${opportunity.title}.`,
    type: "completion",
  });

  res.json({ message: "Proof submitted and notifications sent." });
};

// Delete specific opportunity
export const deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    await Opportunity.findByIdAndDelete(id);
    res.json({ message: "Opportunity deleted successfully" });
  } catch (err) {
    console.error("Delete failed", err);
    res.status(500).json({ error: "Failed to delete opportunity" });
  }
};

export const getOrgNotifications = async (req, res) => {
  try {
    const { orgId } = req.params;
    const notifs = await Notification.find({
      user: orgId,
      userModel: "Organization",
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(notifs);
  } catch (err) {
    console.error("❌ Error fetching organization notifications:", err);
    res
      .status(500)
      .json({ message: "Failed to load organization notifications" });
  }
};

// Dummy activity
export const getActivity = (req, res) => {
  res.json([
    {
      name: "Sarah Johnson",
      action: "Completed Food Bank Sorting",
      time: "2 hours ago",
    },
    {
      name: "Michael Chen",
      action: "Signed up for Community Garden Clean-up",
      time: "4 hours ago",
    },
  ]);
};
