import Opportunity from "../models/Opportunity.js";
import Volunteer from "../models/Volunteer.js";

/**
 * GET all volunteers across all opportunities of a specific organization
 */
export const getOrgVolunteers = async (req, res) => {
  try {
    const orgId = req.user?.id || req.params.orgId;
    if (!orgId)
      return res.status(400).json({ message: "Missing organization ID" });

    const opportunities = await Opportunity.find({ organization: orgId })
      .populate("volunteers", "fullName email contactNumber")
      .populate("completedVolunteers", "_id")
      .populate("completionProofs.volunteer", "_id status");

    // Build grouped structure
    const formatted = opportunities.map((opp) => {
      const volunteers = (opp.volunteers || []).map((vol) => {
        let status = "Pending";

        const proof = opp.completionProofs.find(
          (p) =>
            p.volunteer && p.volunteer._id.toString() === vol._id.toString()
        );
        if (proof?.status === "Approved") status = "Completed";
        else if (proof?.status === "Rejected") status = "Rejected";
        else if (opp.completedVolunteers.some((v) => v._id.equals(vol._id)))
          status = "Completed";

        return {
          _id: vol._id,
          fullName: vol.fullName,
          email: vol.email,
          contactNumber: vol.contactNumber,
          status,
        };
      });

      return {
        _id: opp._id,
        title: opp.title,
        createdAt: opp.createdAt,
        volunteers,
        completedVolunteers: opp.completedVolunteers,
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    console.error("getOrgVolunteers error:", err);
    res.status(500).json({ message: "Failed to load volunteers" });
  }
};

/**
 * PUT — update volunteer status (Approve, Reject, or Complete)
 */
export const updateOrgVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params; // volunteerId
    const { opportunityId, status } = req.body;

    if (!id || !opportunityId || !status) {
      return res.status(400).json({ message: "Missing required data" });
    }

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity)
      return res.status(404).json({ message: "Opportunity not found" });

    // If volunteer not part of it
    const isVolunteer = opportunity.volunteers.some((v) => v.toString() === id);
    if (!isVolunteer)
      return res
        .status(400)
        .json({ message: "This volunteer is not part of the opportunity" });

    // Update logic
    if (status === "Approved") {
      // Nothing extra yet; could mark as confirmed participant
    } else if (status === "Rejected") {
      // Remove from list if rejected
      opportunity.volunteers = opportunity.volunteers.filter(
        (v) => v.toString() !== id
      );
    } else if (status === "Completed") {
      if (!opportunity.completedVolunteers.includes(id)) {
        opportunity.completedVolunteers.push(id);
      }
      opportunity.status = "In Progress";
    }

    // Update proof record if exists
    const proof = opportunity.completionProofs.find(
      (p) => p.volunteer?.toString() === id
    );
    if (proof) {
      proof.status =
        status === "Completed"
          ? "Approved"
          : status === "Rejected"
            ? "Rejected"
            : "Pending";
    }

    await opportunity.save();
  } catch (err) {
    console.error("updateOrgVolunteerStatus error:", err);
    res.status(500).json({ message: "Failed to update volunteer status" });
  }
};
