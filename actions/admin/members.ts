"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole, setUserRole } from "@/lib/supabase/auth-helpers";
import { ROLES } from "@/constants/roles";
import { EXEC_TITLES } from "@/types/exec-title";
import { ROUTES } from "@/constants/routes";
import type { ActionResult } from "@/actions/membership";

const updateRoleSchema = z
  .object({
    memberId: z.string().uuid(),
    role: z.enum(ROLES),
    execTitle: z.enum(EXEC_TITLES).nullable(),
  })
  .refine((v) => v.role !== "exec" || v.execTitle !== null, {
    message: "An exec title is required when the role is Executive.",
    path: ["execTitle"],
  });

/**
 * Promotes/demotes a member. `setUserRole()` writes role + execTitle
 * straight to the `members` row — that table is the only source of
 * truth now (Clerk's publicMetadata mirror is gone), so there's nothing
 * left to keep in sync.
 */
export async function updateMemberRole(input: z.infer<typeof updateRoleSchema>): Promise<ActionResult> {
  const check = await requireRole("admin");
  if (!check.ok) return { success: false, error: "Admin access required." };

  const parsed = updateRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { memberId, role, execTitle } = parsed.data;
  const resolvedExecTitle = role === "exec" ? execTitle : null;

  try {
    // setUserRole() (Supabase version) writes role + execTitle to the
    // members row directly — no separate Clerk publicMetadata write and
    // no clerkUserId lookup needed anymore, since members.id IS the auth
    // user id already.
    await setUserRole(memberId, role, resolvedExecTitle);

    revalidatePath(ROUTES.adminMembers);
    revalidatePath(ROUTES.dashboard);
    return { success: true };
  } catch (err) {
    console.error("updateMemberRole failed:", err);
    return { success: false, error: "Could not update this member's role." };
  }
}
export async function approveMember(memberId: string): Promise<ActionResult> {
  const check = await requireRole("admin");
  if (!check.ok) return { success: false, error: "Admin access required." };

  try {
    // Upgrades the user to a standard member
    await setUserRole(memberId, "member", null);

    revalidatePath(ROUTES.adminMembers);
    return { success: true };
  } catch (err) {
    console.error("approveMember failed:", err);
    return { success: false, error: "Could not approve member." };
  }
}

export async function rejectMember(memberId: string): Promise<ActionResult> {
  const check = await requireRole("admin");
  if (!check.ok) return { success: false, error: "Admin access required." };

  try {
    // Keeps or sets the user as a visitor
    await setUserRole(memberId, "visitor", null);

    revalidatePath(ROUTES.adminMembers);
    return { success: true };
  } catch (err) {
    console.error("rejectMember failed:", err);
    return { success: false, error: "Could not reject member." };
  }
}