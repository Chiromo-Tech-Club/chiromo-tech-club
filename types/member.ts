import type { Role } from "@/types/roles";

export interface Member {
  id: string;
  clerkUserId: string;
  fullName: string;
  email: string;
  role: Role;
  communitySlugs: string[];
  avatarUrl: string | null;
  bio: string | null;
  githubHandle: string | null;
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
