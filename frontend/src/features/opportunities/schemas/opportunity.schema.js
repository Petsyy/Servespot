import { z } from "zod";

export const opportunitySchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(10, "Description must be at least 10 characters"),
  date: z
    .string({ required_error: "Date is required" })
    .min(1, "Date is required"),
  duration: z.string().trim().optional(),
  location: z
    .string({ required_error: "Location is required" })
    .trim()
    .min(2, "Location is required"),
  skills: z.array(z.string()).default([]),
  volunteersNeeded: z.coerce
    .number({ invalid_type_error: "Must be a valid number" })
    .int("Must be an integer")
    .min(1, "At least 1 volunteer is required"),
  file: z.any().optional(),
});

export const opportunityDefaultValues = {
  title: "",
  description: "",
  date: "",
  duration: "",
  location: "",
  skills: [],
  volunteersNeeded: 1,
  file: null,
};

