export class MongooseRepository {
  constructor(model) {
    this.model = model;
  }

  findById(id, options = {}) {
    let query = this.model.findById(id);
    if (options.select) query = query.select(options.select);
    if (options.populate) query = query.populate(options.populate);
    return options.lean ? query.lean() : query;
  }

  findOne(filter, options = {}) {
    let query = this.model.findOne(filter);
    if (options.select) query = query.select(options.select);
    return options.lean ? query.lean() : query;
  }

  find(filter = {}, options = {}) {
    let query = this.model.find(filter);
    if (options.select) query = query.select(options.select);
    if (options.sort) query = query.sort(options.sort);
    if (options.limit) query = query.limit(options.limit);
    if (options.populate) query = query.populate(options.populate);
    return options.lean ? query.lean() : query;
  }

  create(data) {
    return this.model.create(data);
  }
  updateById(id, update, options = {}) {
    return this.model.findByIdAndUpdate(id, update, { new: true, ...options });
  }
  deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }
  count(filter = {}) {
    return this.model.countDocuments(filter);
  }
  updateMany(filter, update) {
    return this.model.updateMany(filter, update);
  }
}
