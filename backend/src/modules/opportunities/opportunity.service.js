export class OpportunityService {
  constructor({ opportunities }) { this.opportunities = opportunities; }
  listForOrganization(id) { return this.opportunities.forOrganization(id); }
  listActive() { return this.opportunities.active(); }
  getById(id, options) { return this.opportunities.findById(id, options); }
  create(data) { return this.opportunities.create(data); }
}
