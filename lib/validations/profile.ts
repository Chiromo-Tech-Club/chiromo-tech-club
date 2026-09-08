import { z } from "zod";
import { LIMITS } from "@/constants/limits";

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(LIMITS.maxNameLength, `Keep your name under ${LIMITS.maxNameLength} characters.`),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters.")
    .max(24, "Username must be under 24 characters.")
    .regex(/^[a-z0-9_]+$/, "Use only lowercase letters, numbers, and underscores.")
    .optional()
    .or(z.literal("")),
  bio: z.string().trim().max(LIMITS.maxDescriptionLength, "Keep your bio a bit shorter.").optional().or(z.literal("")),
  githubHandle: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9-]{0,39}$/, "Enter a valid GitHub username.")
    .optional()
    .or(z.literal("")),
  phoneNumber: z
    .string()
    .trim()
    .max(18)
    .optional()
    .or(z.literal("")),
  course: z.string().trim().max(120).optional().or(z.literal("")),
  yearOfStudy: z.string().trim().max(60).optional().or(z.literal("")),
  campus: z.string().trim().max(120).optional().or(z.literal("")),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
