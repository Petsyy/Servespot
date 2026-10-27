import Volunteer from "./volunteer.model.js";
import Opportunity from "../opportunities/opportunity.model.js";
import { MongooseRepository } from "../../shared/repositories/mongoose.repository.js";

export class VolunteerRepository extends MongooseRepository {
  constructor(model = Volunteer, opportunityModel = Opportunity) {
    super(model);
    this.opportunityModel = opportunityModel;
  }

  activeLeaderboard(limit = 10) {
    return this.model
      .find({ status: "active" })
      .select("fullName points completedTasks badges")
      .sort({ points: -1 })
      .limit(limit);
  }

  findCompletedOpportunities(volunteerId) {
    return this.opportunityModel
      .find({
        "completionProofs.volunteer": volunteerId,
        status: "Completed",
      })
      .lean();
  }

  findJoinedTasks(volunteerId) {
    return this.opportunityModel
      .find({ volunteers: volunteerId })
      .populate("organization", "orgName location")
      .sort({ date: -1 });
  }

  findActiveJoinedOpportunities(volunteerId) {
    return this.opportunityModel
      .find({
        volunteers: volunteerId,
        status: { $nin: ["Completed", "Closed"] },
      })
      .populate("organization", "orgName")
      .sort({ date: 1 });
  }

  countHigherPoints(points) {
    return this.model.countDocuments({ points: { $gt: points } });
  }

  findTopVolunteers(limit = 3) {
    return this.model
      .find({}, "fullName points")
      .sort({ points: -1 })
      .limit(limit)
      .lean();
  }
}

export const volunteerRepository = new VolunteerRepository();
