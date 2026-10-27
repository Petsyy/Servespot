import Admin from "./admin.model.js";
import { MongooseRepository } from "../../shared/repositories/mongoose.repository.js";

export class AdminRepository extends MongooseRepository {
  constructor(model = Admin) {
    super(model);
  }
  active() {
    return this.find({ status: "active" });
  }
}
export const adminRepository = new AdminRepository();
