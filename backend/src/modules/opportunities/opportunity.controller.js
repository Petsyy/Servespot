import { opportunityService } from "./opportunity.service.js";

// Fetch all opportunities for an organization
export const getOpportunities = async (req, res) => {
  try {
    const { orgId } = req.params;
    const opportunities = await opportunityService.listForOrganization(orgId);
    res.json(opportunities);
  } catch (err) {
    console.error("Error fetching opportunities:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Error fetching opportunities" });
  }
};

// Create a new opportunity
export const createOpportunity = async (req, res) => {
  try {
    const opportunity = await opportunityService.createOpportunity({
      data: req.body,
      file: req.file,
    });

    res.status(201).json({
      message: "Opportunity created successfully!",
      opportunity,
    });
  } catch (err) {
    console.error("Error creating opportunity:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Error creating opportunity" });
  }
};

// Update an existing opportunity
export const updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await opportunityService.updateOpportunity(id, {
      data: req.body,
      file: req.file,
    });

    res.status(200).json({
      message: "Opportunity updated successfully!",
      opportunity,
    });
  } catch (err) {
    console.error("Error updating opportunity:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to update opportunity" });
  }
};

// Volunteer signs up for an opportunity
export const volunteerSignup = async (req, res) => {
  try {
    const volunteerId = req.user?.id;
    const opportunityId = req.params.id;

    const result = await opportunityService.volunteerSignup(
      opportunityId,
      volunteerId,
    );

    res.status(200).json({
      message: "Successfully joined the opportunity!",
      ...result,
    });
  } catch (err) {
    console.error("Volunteer signup error:", err);
    res.status(err.status || 500).json({
      message: err.message || "Server error during volunteer signup",
    });
  }
};

// Fetch uncompleted opportunities (public/active board)
export const getAllOpportunities = async (_req, res) => {
  try {
    const opportunities = await opportunityService.listActive();
    res.status(200).json(opportunities);
  } catch (err) {
    console.error("Error fetching opportunities:", err);
    res.status(err.status || 500).json({
      message: "Failed to load opportunities",
      error: err.message,
    });
  }
};

// Mark opportunity as completed and reward volunteers
export const markOpportunityCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await opportunityService.markOpportunityCompleted(id);

    res.status(200).json({
      message: `Opportunity marked as completed. ${result.completedCount} volunteer(s) rewarded and notified.`,
      ...result,
    });
  } catch (err) {
    console.error("Error marking opportunity completed:", err);
    res.status(err.status || 500).json({
      message: err.message || "Failed to mark opportunity completed",
      error: err.message,
    });
  }
};

// Fetch stats for an organization
export const getStats = async (req, res) => {
  try {
    const { orgId } = req.params;
    const stats = await opportunityService.getStats(orgId);
    res.json(stats);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(err.status || 500).json({ message: "Failed to fetch stats" });
  }
};

// Get volunteers for a specific opportunity
export const getOpportunityVolunteers = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await opportunityService.getOpportunityVolunteers(id);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching volunteers:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to load volunteers" });
  }
};

// Get specific opportunity by ID (detail view)
export const getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await opportunityService.getById(id);
    res.status(200).json(opportunity);
  } catch (err) {
    if (err.status !== 400) {
      console.error("Error fetching opportunity details:", err);
    }
    res.status(err.status || 500).json({
      message: err.message || "Failed to load opportunity details",
      error: err.message,
    });
  }
};

// Confirm completion of a volunteer by organization
export const confirmVolunteerCompletion = async (req, res) => {
  try {
    const { oppId, volunteerId } = req.params;
    const result = await opportunityService.confirmVolunteerCompletion(
      oppId,
      volunteerId,
    );

    if (result.alreadyCompleted) {
      return res.status(200).json({
        message: "Volunteer already marked as completed",
        status: result.opportunityStatus,
      });
    }

    res.status(200).json({
      message: "Volunteer marked as completed",
      ...result,
    });
  } catch (err) {
    console.error("Error confirming volunteer completion:", err);
    res.status(err.status || 500).json({
      message: err.message || "Server error confirming completion",
      error: err.message,
    });
  }
};

// Submit volunteer completion proof
export const submitCompletionProof = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteerId = req.user?.id;
    const { message } = req.body;

    const proof = await opportunityService.submitCompletionProof(
      id,
      volunteerId,
      {
        message,
        file: req.file,
      },
    );

    res.status(201).json({
      message: "Proof submitted successfully. Awaiting organization review.",
      proof,
    });
  } catch (err) {
    console.error("Error submitting proof:", err);
    res.status(err.status || 500).json({
      message: err.message || "Failed to submit proof",
      error: err.message,
    });
  }
};

// Review volunteer completion proof (Approve / Reject)
export const reviewCompletionProof = async (req, res) => {
  try {
    const { id, volunteerId } = req.params;
    const { action } = req.body;

    const result = await opportunityService.reviewCompletionProof(
      id,
      volunteerId,
      action,
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("Error reviewing proof:", err);
    res.status(err.status || 500).json({
      message: err.message || "Failed to review proof",
      error: err.message,
    });
  }
};

// Force complete opportunity (Admin / Override)
export const forceCompleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    await opportunityService.forceCompleteOpportunity(id);
    res.json({ message: "Opportunity forcibly marked as completed." });
  } catch (err) {
    console.error("Force complete error:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to force complete opportunity" });
  }
};

// Legacy submitProof alias
export const submitProof = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const volunteerId = req.user?.id;
    const { message } = req.body;

    await opportunityService.submitCompletionProof(opportunityId, volunteerId, {
      message,
      file: req.file,
    });

    res.json({ message: "Proof submitted and notifications sent." });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// Delete opportunity
export const deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    await opportunityService.deleteOpportunity(id);
    res.json({ message: "Opportunity deleted successfully" });
  } catch (err) {
    console.error("Delete failed:", err);
    res
      .status(err.status || 500)
      .json({ error: "Failed to delete opportunity" });
  }
};

// Get organization notifications
export const getOrgNotifications = async (req, res) => {
  try {
    const { orgId } = req.params;
    const notifs = await opportunityService.getOrgNotifications(orgId);
    res.json(notifs);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res
      .status(err.status || 500)
      .json({ message: "Failed to load organization notifications" });
  }
};

// Activity feed
export const getActivity = (_req, res) => {
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
