import { z } from "zod";
import { isKnownCommunitySlug } from "@/utils/get-community-slug";

export const registrationStep1Schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(80, "Name must be under 80 characters."),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  phoneNumber: z
    .string()
    .trim()
    .min(9, "Please enter a valid phone number.")
    .regex(/^[0-9+\s()-]{9,18}$/, "Enter a valid phone number (e.g. 0712345678 or +254712345678)."),
  githubHandle: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9-]{0,39}$/, "Enter a valid GitHub username.")
    .optional()
    .or(z.literal("")),
  bio: z.string().trim().max(300, "Keep your bio under 300 characters.").optional(),
});

export const registrationStep2Schema = z.object({
  studentId: z
    .string()
    .trim()
    .min(3, "Please enter your student / registration ID (e.g., P15/12345/2024).")
    .max(30, "Registration number is too long."),
  campus: z.string().trim().min(2, "Please select or specify your campus location."),
  isChiromo: z.boolean().default(true),
  faculty: z.string().trim().optional(),
  course: z.string().trim().min(2, "Please enter your degree / course of study (e.g., BSc Computer Science)."),
  yearOfStudy: z.string().trim().min(1, "Please select your year of study."),
});

export const registrationStep3Schema = z.object({
  communitySlugs: z
    .array(z.string())
    .min(1, "Select at least one technical track or community.")
    .refine((slugs) => slugs.every(isKnownCommunitySlug), "One of the selected communities is invalid."),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  learningGoals: z.string().trim().max(500, "Keep your goals under 500 characters.").optional(),
});

export const registrationStep4Schema = z.object({
  paymentOption: z.enum(["full_500", "deposit_250", "pay_later"]),
  mpesaReference: z
    .string()
    .trim()
    .max(20, "M-Pesa code should be under 20 characters.")
    .optional()
    .or(z.literal("")),
  mpesaPhoneNumber: z
    .string()
    .trim()
    .max(18)
    .optional()
    .or(z.literal("")),
});

export const fullRegistrationSchema = z.object({
  ...registrationStep1Schema.shape,
  ...registrationStep2Schema.shape,
  ...registrationStep3Schema.shape,
  ...registrationStep4Schema.shape,
  agreedToCodeOfConduct: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Chiromo Tech Club constitution and code of conduct.",
  }),
});

export type RegistrationStep1Input = z.infer<typeof registrationStep1Schema>;
export type RegistrationStep2Input = z.infer<typeof registrationStep2Schema>;
export type RegistrationStep3Input = z.infer<typeof registrationStep3Schema>;
export type RegistrationStep4Input = z.infer<typeof registrationStep4Schema>;
export type FullRegistrationInput = z.infer<typeof fullRegistrationSchema>;
