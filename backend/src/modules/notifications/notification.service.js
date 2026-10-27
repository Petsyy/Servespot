export class NotificationService {
  constructor(repository) { this.repository = repository; }
  list(user, userModel) { return this.repository.forUser(user, userModel); }
  markRead(id) { return this.repository.updateById(id, { isRead: true }); }
  async listVolunteer(user) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    await this.repository.removeOlderThan(user, "Volunteer", cutoff);
    return this.repository.find({ user, userModel: "Volunteer" }, { sort: { createdAt: -1 }, limit: 100, lean: true });
  }
  markAllRead(user, userModel) { return this.repository.markAllRead(user, userModel); }
}
