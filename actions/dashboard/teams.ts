"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { teams, teamMembers } from "@/lib/drizzle/schema";
import { requireRole } from "@/lib/clerk/client";
import { getCurrentMember } from "@/lib/clerk/get-current-user";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().max(500).optional(),
  leadId: z.string().uuid().optional().nullable(),
});

export async function createTeam(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const check = await requireRole("exec");
  if (!check.ok) return { success: false, error: "Executive access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb().insert(teams).values({
      name: parsed.data.name,
      description: parsed.data.description || null,
      leadId: parsed.data.leadId || null,
      createdById: member.id,
    });
    revalidatePath("/dashboard/membership_officer/teams");
    return { success: true };
  } catch (err) {
    console.error("createTeam failed:", err);
    return { success: false, error: "Could not save this team." };
  }
}

const addMemberSchema = z.object({ teamId: z.string().uuid(), memberId: z.string().uuid() });

export async function addTeamMember(input: z.infer<typeof addMemberSchema>): Promise<ActionResult> {
  const check = await requireRole("exec");
  if (!check.ok) return { success: false, error: "Executive access required." };

  const parsed = addMemberSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  try {
    await getDb().insert(teamMembers).values({ teamId: parsed.data.teamId, memberId: parsed.data.memberId }).onConflictDoNothing();
    revalidatePath("/dashboard/membership_officer/teams");
    return { success: true };
  } catch (err) {
    console.error("addTeamMember failed:", err);
    return { success: false, error: "Could not add this member." };
  }
}
