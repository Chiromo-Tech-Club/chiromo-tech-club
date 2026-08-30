import type { Role } from "@/types/roles";
import type { ExecTitle } from "@/types/exec-title";
import type { MemberStatus } from "@/types/member-status";

export type MembershipFeeStatus = "unpaid" | "deposit_paid" | "fully_paid";
export type AuthProviderType = "google" | "email_password";

export interface Member {
  id: string;
  clerkUserId?: string;
  fullName: string;
  email: string;
  role: Role;
  execTitle: ExecTitle | null;
  communitySlugs: string[];
  avatarUrl: string | null;
  bio: string | null;
  githubHandle: string | null;
  studentId?: string | null;
  campus?: string | null;
  isChiromo?: boolean;
  course?: string | null;
  yearOfStudy?: string | null;
  phoneNumber?: string | null;
  authProvider?: AuthProviderType | string;
  membershipStatus?: MemberStatus;
  membershipFeeStatus?: MembershipFeeStatus;
  feeAmountPaid?: number;
  mpesaReference?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Shape accepted by the "join the club" form, before a Member exists. */
export interface MemberDraft {
  fullName: string;
  email: string;
  communitySlugs: string[];
  bio?: string;
  githubHandle?: string;
}

/** Shape accepted by the progressive disclosure registration wizard. */
export interface ClubRegistrationInput {
  // Step 1: Personal
  fullName: string;
  email: string;
  phoneNumber: string;
  githubHandle?: string;
  bio?: string;
  // Step 2: Academic & Campus
  studentId: string;
  campus: string;
  isChiromo: boolean;
  faculty?: string;
  course: string;
  yearOfStudy: string;
  // Step 3: Communities & Tech Tracks
  communitySlugs: string[];
  experienceLevel: "beginner" | "intermediate" | "advanced";
  learningGoals?: string;
  // Step 4: Fee & Payment Plan
  paymentOption: "full_500" | "deposit_250" | "pay_later";
  mpesaReference?: string;
  mpesaPhoneNumber?: string;
  // Step 5: Terms
  agreedToCodeOfConduct: boolean;
}
