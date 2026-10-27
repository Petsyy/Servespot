import Organization from "./organization.model.js";
import { MongooseRepository } from "../../shared/repositories/mongoose.repository.js";

export class OrganizationRepository extends MongooseRepository {
  constructor(model = Organization) {
    super(model);
  }
}

export const organizationRepository = new OrganizationRepository();
