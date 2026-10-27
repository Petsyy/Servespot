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
    return this.find(
      { status: { $nin: ["Completed", "Closed"] } },
      { sort: { createdAt: -1 } },
    );
  }
}
export const opportunityRepository = new OpportunityRepository();
