"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, desc, eq, gt } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { execMessages, execTyping, members } from "@/lib/drizzle/schema";
import { requireRole } from "@/lib/supabase/auth-helpers";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import type { ActionResult } from "@/actions/membership";

const TYPING_FRESH_MS = 5000;

const createSchema = z.object({ body: z.string().min(1).max(2000) });
const editSchema = z.object({
  id: z.string().uuid(),
  body: z.string().min(1).max(2000),
});
const typingSchema = z.object({ isTyping: z.boolean() });

export interface ChatMessageItem {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  authorTitle: string | null;
  authorAvatarUrl: string | null;
  createdAt: string;
  editedAt: string | null;
}

export interface ChatUpdates {
  messages: ChatMessageItem[];
  typingMemberNames: string[];
}

export async function postMessage(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const check = await requireRole("exec");
  if (!check.ok) return { success: false, error: "Executive access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Message can't be empty." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    const db = getDb();
    await db.insert(execMessages).values({ body: parsed.data.body, authorId: member.id });
    await db.delete(execTyping).where(eq(execTyping.memberId, member.id));
    revalidatePath("/dashboard/chat");
    return { success: true };
  } catch (err) {
    console.error("postMessage failed:", err);
    return { success: false, error: "Could not send this message." };
  }
}

export async function editMessage(input: z.infer<typeof editSchema>): Promise<ActionResult> {
  const check = await requireRole("exec");
  if (!check.ok) return { success: false, error: "Executive access required." };

  const parsed = editSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Message can't be empty." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    const db = getDb();
    const [existing] = await db
      .select({ authorId: execMessages.authorId })
      .from(execMessages)
      .where(eq(execMessages.id, parsed.data.id))
      .limit(1);

    if (!existing) return { success: false, error: "Message not found." };
    if (existing.authorId !== member.id) {
      return { success: false, error: "You can only edit your own messages." };
    }

    await db
      .update(execMessages)
      .set({ body: parsed.data.body, editedAt: new Date() })
      .where(eq(execMessages.id, parsed.data.id));

    revalidatePath("/dashboard/chat");
    return { success: true };
  } catch (err) {
    console.error("editMessage failed:", err);
    return { success: false, error: "Could not save this edit." };
  }
}

export async function setTyping(input: z.infer<typeof typingSchema>): Promise<void> {
  const check = await requireRole("exec");
  if (!check.ok) return;

  const parsed = typingSchema.safeParse(input);
  if (!parsed.success) return;

  const member = await getCurrentMember();
  if (!member) return;

  const db = getDb();
  try {
    if (parsed.data.isTyping) {
      await db
        .insert(execTyping)
        .values({ memberId: member.id, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: execTyping.memberId,
          set: { updatedAt: new Date() },
        });
    } else {
      await db.delete(execTyping).where(eq(execTyping.memberId, member.id));
    }
  } catch (err) {
    console.error("setTyping failed:", err);
  }
}

export async function getChatUpdates(): Promise<ChatUpdates> {
  const check = await requireRole("exec");
  if (!check.ok) return { messages: [], typingMemberNames: [] };

  const member = await getCurrentMember();
  if (!member) return { messages: [], typingMemberNames: [] };

  const db = getDb();

  const rows = await db
    .select({
      id: execMessages.id,
      body: execMessages.body,
      authorId: execMessages.authorId,
      authorName: members.fullName,
      authorTitle: members.execTitle,
      authorAvatarUrl: members.avatarUrl,
      createdAt: execMessages.createdAt,
      editedAt: execMessages.editedAt,
    })
    .from(execMessages)
    .innerJoin(members, eq(execMessages.authorId, members.id))
    .orderBy(desc(execMessages.createdAt))
    .limit(100);

  const freshSince = new Date(Date.now() - TYPING_FRESH_MS);
  const typingRows = await db
    .select({ authorName: members.fullName, memberId: execTyping.memberId })
    .from(execTyping)
    .innerJoin(members, eq(execTyping.memberId, members.id))
    .where(gt(execTyping.updatedAt, freshSince));

  return {
    messages: rows.reverse().map((r) => ({
      id: r.id,
      body: r.body,
      authorId: r.authorId,
      authorName: r.authorName,
      authorTitle: r.authorTitle,
      authorAvatarUrl: r.authorAvatarUrl,
      createdAt: r.createdAt.toISOString(),
      editedAt: r.editedAt ? r.editedAt.toISOString() : null,
    })),
    typingMemberNames: typingRows.filter((t) => t.memberId !== member.id).map((t) => t.authorName),
  };
}