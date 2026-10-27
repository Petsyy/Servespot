import { z } from "zod";
import { MAX_SELECTION } from "@/features/volunteers/constants/volunteerOptions";

const passwordRegexRules = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .regex(/^[A-Z]/, "Password must start with a capital letter")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain a special character");

export const volunteerAccountSchema = z
  .object({
    firstName: z
      .string({ required_error: "First name is required" })
      .trim()
      .min(1, "First name is required"),
    middleName: z.string().trim().optional(),
    lastName: z
      .string({ required_error: "Last name is required" })
      .trim()
      .min(1, "Last name is required"),
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

export const volunteerProfileSchema = z.object({
  birthdate: z
    .string({ required_error: "Birthdate is required" })
    .min(1, "Birthdate is required")
    .refine((val) => {
      const bd = new Date(val);
      if (Number.isNaN(bd.getTime())) return false;
      const today = new Date();
      let age = today.getFullYear() - bd.getFullYear();
      const m = today.getMonth() - bd.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age -= 1;
      return age >= 18 && age <= 120;
    }, "You must be at least 18 years old to sign up"),
  gender: z.string().min(1, "Gender is required"),
  contact: z
    .string({ required_error: "Contact number is required" })
    .regex(/^09\d{9}$/, "Contact number must start with 09 and be 11 digits"),
  region: z.string().min(1, "Region is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().optional(),
  barangay: z.string().optional(),
  address: z.string().optional(),
  skills: z
    .array(z.string())
    .min(1, "Please select at least one skill")
    .max(MAX_SELECTION, `You can select up to ${MAX_SELECTION} skills only`),
  interests: z
    .array(z.string())
    .min(1, "Please select at least one interest")
    .max(MAX_SELECTION, `You can select up to ${MAX_SELECTION} interests only`),
  availability: z
    .array(z.string())
    .min(1, "Please select at least one availability day")
    .max(MAX_SELECTION, `You can select up to ${MAX_SELECTION} availability days only`),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

