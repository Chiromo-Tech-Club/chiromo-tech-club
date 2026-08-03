import { z } from "zod";
import { LIMITS } from ".././../constants/limits";
import { isKnownCommunitySlug } from ".././../utils/get-community-slug";

export const memberDraftSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(LIMITS.maxNameLength, `Keep it under ${LIMITS.maxNameLength} characters.`),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  communitySlugs: z
    .array(z.string())
    .min(1, "Pick at least one community.")
    .refine((slugs) => slugs.every(isKnownCommunitySlug), "One of the selected communities is invalid."),
  bio: z.string().trim().max(LIMITS.maxDescriptionLength).optional(),
  githubHandle: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9-]{1,39}$/, "Enter a valid GitHub username.")
    .optional()
    .or(z.literal("")),
});

export type MemberDraftInput = z.infer<typeof memberDraftSchema>;
