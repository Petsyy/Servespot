import mongoose from "mongoose";

export class OrganizationService {
  constructor(repository) {
    this.repository = repository;
  }
  async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return { invalidId: true };
    return { organization: await this.repository.findById(id) };
  }
  update(id, updates) {
    return this.repository.updateById(id, updates, { runValidators: true });
  }
}
