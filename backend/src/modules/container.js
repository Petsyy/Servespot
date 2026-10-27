import { volunteerRepository } from "./volunteers/volunteer.repository.js";
import { organizationRepository } from "./organizations/organization.repository.js";
import { opportunityRepository } from "./opportunities/opportunity.repository.js";
import { adminRepository } from "./admin/admin.repository.js";
import { notificationRepository } from "./notifications/notification.repository.js";

export const repositories = {
  volunteers: volunteerRepository,
  organizations: organizationRepository,
  opportunities: opportunityRepository,
  admins: adminRepository,
  notifications: notificationRepository,
};
