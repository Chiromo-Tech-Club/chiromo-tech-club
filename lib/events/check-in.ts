import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { members } from "@/lib/drizzle/schema";
import { formatMembershipId } from "@/lib/membership/card";
import { getCurrentExecTitle, getCurrentRole } from "@/lib/supabase/auth-helpers";

export const CHECKIN_EVENT_COOKIE = "ctc_checkin_event";

/** Corporate Affairs, Membership, and administrators can scan cards and log guests. */
export async function canCheckInEvents(): Promise<boolean> {
  const role = await getCurrentRole();
  if (role === "admin") return true;
  if (role !== "exec") return false;
  const title = await getCurrentExecTitle();
  return title === "corporate_affairs" || title === "membership_officer";
}

export async function findMemberByCard(memberId: string | null, mid: string | null) {
  const db = getDb();
  const columns = {
    id: members.id,
    fullName: members.fullName,
    email: members.email,
    campus: members.campus,
    isChiromo: members.isChiromo,
    studentId: members.studentId,
    membershipStatus: members.membershipStatus,
  };

  if (memberId) {
    const [row] = await db
      .select(columns)
      .from(members)
      .where(and(eq(members.id, memberId), isNull(members.deletedAt)))
      .limit(1);
    if (row) return row;
  }

  const cardId = mid?.trim();
  if (!cardId) return null;

  const rows = await db.select(columns).from(members).where(isNull(members.deletedAt));
  return (
    rows.find(
      (row) =>
        formatMembershipId({
          campus: row.campus,
          isChiromo: row.isChiromo,
          studentId: row.studentId,
          memberId: row.id,
        }) === cardId,
    ) ?? null
  );
}
