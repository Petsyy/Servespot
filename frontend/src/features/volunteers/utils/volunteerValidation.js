import { volunteerProfileSchema } from "@/features/auth/schemas/volunteerRegistration.schema";

export function validateVolunteerProfile(formData) {
  // Normalize location fields
  const normalized = {
    ...formData,
    region: formData.region || formData.regionCode || "",
    city: formData.city || formData.cityCode || "",
  };

  const result = volunteerProfileSchema.safeParse(normalized);
  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  });

  return {
    isValid: false,
    errors,
  };
}
