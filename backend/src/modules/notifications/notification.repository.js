import Notification from "./notification.model.js";
import { MongooseRepository } from "../../shared/repositories/mongoose.repository.js";

export class NotificationRepository extends MongooseRepository {
  constructor(model = Notification) {
    super(model);
  }
  forUser(user, userModel) {
    return this.find(
      { user, ...(userModel ? { userModel } : {}) },
      { sort: { createdAt: -1 } },
    );
  }
  markAllRead(user, userModel) {
    return this.updateMany(
      { user, userModel, isRead: false },
      { $set: { isRead: true } },
    );
  }
  removeOlderThan(user, userModel, date) {
    return this.model.deleteMany({ user, userModel, createdAt: { $lt: date } });
  }
}

export const notificationRepository = new NotificationRepository();
