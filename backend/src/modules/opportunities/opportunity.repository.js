import Opportunity from "./opportunity.model.js";
import { MongooseRepository } from "../../shared/repositories/mongoose.repository.js";

export class OpportunityRepository extends MongooseRepository {
  constructor(model = Opportunity) {
    super(model);
  }

  forOrganization(organization) {
    return this.find({ organization });
  }

  active() {
    return this.model
      .find({ status: { $nin: ["Completed", "Closed"] } })
      .populate("organization", "orgName")
      .select(
        "title description organization location date duration volunteersNeeded volunteers skills status fileUrl points completionProofs"
      )
      .sort({ createdAt: -1 });
  }

  findByIdWithDetails(id) {
    return this.model
      .findById(id)
      .populate("organization", "orgName email")
      .populate("completionProofs.volunteer", "fullName email")
      .lean();
  }

  findByIdPopulated(id) {
    return this.model
      .findById(id)
      .populate("completionProofs.volunteer", "email fullName")
      .populate("volunteers");
  }

  findWithVolunteers(id) {
    return this.model
      .findById(id)
      .populate(
        "volunteers",
        "firstName lastName fullName email city skills interests availability"
      )
      .lean();
  }

  findForStats(orgId) {
    return this.model
      .find({ organization: orgId })
      .populate("volunteers", "_id")
      .populate("completedVolunteers", "_id")
      .lean();
  }

  deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }
}

export const opportunityRepository = new OpportunityRepository();
