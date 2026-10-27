export class VolunteerService {
  constructor({ volunteers, opportunities }) {
    this.volunteers = volunteers;
    this.opportunities = opportunities;
  }
  async profile(id) {
    return this.volunteers.findById(id, { lean: true });
  }
  updateProfile(id, updates) {
    return this.volunteers.updateById(id, { $set: updates });
  }
  leaderboard(limit = 10) {
    return this.volunteers.activeLeaderboard(limit);
  }
}
