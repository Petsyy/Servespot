import { z } from "zod";

const passwordRegexRules = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .regex(/^[A-Z]/, "Password must start with a capital letter")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain a special character");

export const organizationAccountSchema = z
  .object({
    orgName: z
      .string({ required_error: "Organization name is required" })
      .trim()
      .min(1, "Organization name is required"),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .min(1, "Valid email is required")
      .email("Valid email is required")
      .refine(
        (val) => !/@example\.com$/i.test(val),
        "Please use a real email address (not example.com)"
      ),
    password: passwordRegexRules,
    confirmPassword: z.string({ required_error: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const organizationProfileSchema = z.object({
  contactPerson: z
    .string({ required_error: "Contact person is required" })
    .trim()
    .min(1, "Contact person is required"),
  contactNumber: z
    .string({ required_error: "Contact number is required" })
    .trim()
    .regex(/^09\d{9}$/, "Contact number must start with 09 and be 11 digits"),
  region: z.string().min(1, "Region is required"),
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City/Municipality is required"),
  barangay: z.string().min(1, "Barangay is required"),
  address: z.string().optional(),
  orgType: z.string().min(1, "Organization type is required"),
  description: z.string().optional(),
});

