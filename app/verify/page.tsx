import { desc, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/lib/drizzle/client";
import { ensureClubTools } from "@/lib/drizzle/ensure-club-tools";
import { events } from "@/lib/drizzle/schema";
import { CHECKIN_EVENT_COOKIE, canCheckInEvents, findMemberByCard } from "@/lib/events/check-in";
import { formatMembershipId } from "@/lib/membership/card";
import { formatEventDate, formatEventTime } from "@/lib/utils/format-date";
import { AutoArrive, ManualArrive } from "@/features/events/CardCheckIn";
import { Navbar } from "@/components/navigation/Navbar";

export const metadata = { title: "Membership card" };

export default async function VerifyMembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ mid?: string; member?: string }>;
}) {
  const params = await searchParams;
  const mid = params.mid?.trim() || null;
  const memberParam = params.member?.trim() || null;
  const memberId = /^[0-9a-f-]{36}$/i.test(memberParam ?? "") ? memberParam : null;

  const member = await findMemberByCard(memberId, mid);
  const cardId = member
    ? formatMembershipId({
        campus: member.campus,
        isChiromo: member.isChiromo,
        studentId: member.studentId,
        memberId: member.id,
      })
    : mid;

  const checker = await canCheckInEvents();
  const jar = await cookies();
  const eventId = jar.get(CHECKIN_EVENT_COOKIE)?.value ?? null;

  let eventChoices: { id: string; label: string }[] = [];
  if (checker && member && !eventId) {
    await ensureClubTools();
    const rows = await getDb()
      .select({ id: events.id, title: events.title, startsAt: events.startsAt })
      .from(events)
      .where(isNull(events.deletedAt))
      .orderBy(desc(events.startsAt))
      .limit(20);
    eventChoices = rows.map((row) => ({
      id: row.id,
      label: `${row.title} — ${formatEventDate(row.startsAt.toISOString())} · ${formatEventTime(row.startsAt.toISOString())}`,
    }));
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-lg px-5 py-16">
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Chiromo Tech Club</p>
          {member ? (
            <>
              <h1 className="mt-2 font-display text-2xl font-bold text-ink">{member.fullName}</h1>
              <p className="mt-1 text-sm text-ink-2">{member.email}</p>
              <p className="mt-3 font-mono text-xs text-ink">{cardId}</p>
              <p className="mt-2 text-sm text-ink-2">
                {member.membershipStatus === "approved" ? "This is a valid membership card." : "This card is on file, and membership is not approved yet."}
              </p>
              {checker && eventId ? <div className="mt-4"><AutoArrive eventId={eventId} memberId={member.id} /></div> : null}
              {checker && !eventId ? <ManualArrive memberId={member.id} events={eventChoices} /> : null}
            </>
          ) : (
            <>
              <h1 className="mt-2 font-display text-2xl font-bold text-ink">Card not recognised</h1>
              <p className="mt-2 text-sm text-ink-2">
                This QR code does not match a club member. Corporate Affairs or Membership can log the person
                by name and email on the event check-in page.
              </p>
            </>
          )}
        </div>
      </main>
    </>
  );
}
