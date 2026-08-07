"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { members } from "@/lib/drizzle/schema";
import { requireRole, setUserRole } from "@/lib/clerk/client";
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
 * Promotes/demotes a member. Updates the `members` row (the DB-side
 * source of truth used for display/queries) and Clerk's publicMetadata
 * (the source of truth `getCurrentRole()`/route protection actually read)
 * in the same action, so an admin never has to touch two dashboards or
 * risk the two falling out of sync.
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

  const db = getDb();
  try {
    const [row] = await db.select({ clerkUserId: members.clerkUserId }).from(members).where(eq(members.id, memberId)).limit(1);
    if (!row) return { success: false, error: "Member not found." };

    await db.update(members).set({ role, execTitle: resolvedExecTitle, updatedAt: new Date() }).where(eq(members.id, memberId));
    await setUserRole(row.clerkUserId, role, resolvedExecTitle);

    revalidatePath(ROUTES.adminMembers);
    revalidatePath(ROUTES.dashboard);
    return { success: true };
  } catch (err) {
    console.error("updateMemberRole failed:", err);
    return { success: false, error: "Could not update this member's role." };
  }
}
