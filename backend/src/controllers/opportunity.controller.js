import Opportunity from "../models/Opportunity.js";
import { awardVolunteerRewards } from "../utils/volunteer.badges.js";

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

// Create a new opportunity with file upload
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

    await opportunity.save();
    console.log("Saved opportunity for org:", organization);

    // Return full object wrapped in a message
    return res.status(201).json({
      message: "Opportunity created successfully!",
      opportunity,
    });
  } catch (err) {
    console.error("Error creating opportunity:", err);
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

    // update fields
    opportunity.title = title || opportunity.title;
    opportunity.description = description || opportunity.description;
    opportunity.date = date ? new Date(date) : opportunity.date;
    opportunity.duration = duration || opportunity.duration;
    opportunity.location = location || opportunity.location;
    opportunity.volunteersNeeded =
      Number(volunteersNeeded) || opportunity.volunteersNeeded;

    // update skills
    let skills = req.body.skills || req.body["skills[]"] || [];
    if (!Array.isArray(skills)) skills = [skills];
    opportunity.skills = skills;

    // if new file uploaded
    if (req.file) {
      // optionally remove old file
      if (opportunity.fileUrl && fs.existsSync(`.${opportunity.fileUrl}`)) {
        fs.unlinkSync(`.${opportunity.fileUrl}`);
      }
      opportunity.fileUrl = `/uploads/${req.file.filename}`;
    }

    await opportunity.save();
    res.status(200).json({ message: "Opportunity updated", opportunity });
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

    console.log(" Volunteer Signup:", { volunteerId, opportunityId });

    if (!volunteerId) {
      return res.status(400).json({ message: "Invalid volunteer token or ID" });
    }

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    // Block closed
    if (opportunity.status === "Closed") {
      return res
        .status(400)
        .json({ message: "This opportunity is already closed." });
    }

    // Prevent duplicates
    if (opportunity.volunteers.includes(volunteerId)) {
      return res
        .status(400)
        .json({ message: "Already signed up for this opportunity" });
    }

    // Add volunteer
    opportunity.volunteers.push(volunteerId);

    if (opportunity.volunteers.length >= opportunity.volunteersNeeded) {
      opportunity.status = "In Progress";
    }

    await opportunity.save();

    console.log("✅ Volunteer added:", volunteerId, "→", opportunity.title);

    res.status(200).json({
      message: "Successfully signed up!",
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

// Fetch all opportunities (public view for volunteers)
export const getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find()
      .populate("organization", "orgName") // only return orgName
      .select(
        "title description organization location date duration volunteersNeeded currentVolunteers skills status fileUrl points"
      )
      .sort({ createdAt: -1 });

    console.log("Returning opportunities", opportunities);
    res.status(200).json(opportunities);
  } catch (err) {
    console.error("Error fetching all opportunities:", err);
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
    const total = await Opportunity.countDocuments({ organization: orgId });
    const open = await Opportunity.countDocuments({
      organization: orgId,
      status: "Open",
    });
    const inProgress = await Opportunity.countDocuments({
      organization: orgId,
      status: "In Progress",
    });
    const closed = await Opportunity.countDocuments({
      organization: orgId,
      status: "Closed",
    });

    res.json({
      total,
      active: open,
      inProgress,
      completedTasks: closed,
      engagedVolunteers: 1, // placeholder
      totalHours: 2, // placeholder
    });
  } catch (err) {
    console.error(err);
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
        "firstName lastName email city skills interests availability"
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

// Dummy notifications
export const getNotifications = (req, res) => {
  res.json([
    {
      title: "5 new volunteers signed up for Community Garden Clean-up",
      time: "30 minutes ago",
    },
    {
      title: "Food Bank Sorting completed by 12 volunteers",
      time: "2 hours ago",
    },
    {
      title: "Reminder: Senior Center Visit starts tomorrow",
      time: "5 hours ago",
    },
  ]);
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
