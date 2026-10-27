import Volunteer from "./volunteer.model.js";
import { MongooseRepository } from "../../shared/repositories/mongoose.repository.js";

export class VolunteerRepository extends MongooseRepository {
  constructor(model = Volunteer) {
    super(model);
  }
  activeLeaderboard(limit) {
    return this.find(
      { status: "active" },
      {
        select: "fullName points completedTasks badges",
        sort: { points: -1 },
        limit,
      },
    );
  }
}
export const volunteerRepository = new VolunteerRepository();
