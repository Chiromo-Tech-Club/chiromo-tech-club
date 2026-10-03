import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/lib/drizzle/client";
import { ensureClubTools } from "@/lib/drizzle/ensure-club-tools";
import { eventRegistrations, eventWalkIns, events, members } from "@/lib/drizzle/schema";
import { CHECKIN_EVENT_COOKIE, canCheckInEvents } from "@/lib/events/check-in";
import { formatEventDate, formatEventTime } from "@/lib/utils/format-date";
import { CheckInEventPicker, WalkInForm } from "@/features/dashboard/EventCheckInForms";

function formatWhen(value: Date) {
  return `${formatEventDate(value.toISOString())} · ${formatEventTime(value.toISOString())}`;
}

export async function EventCheckInDesk() {
  if (!(await canCheckInEvents())) {
    return <p className="text-sm text-muted">Only Corporate Affairs, Membership, and administrators can check people in.</p>;
  }

  await ensureClubTools();
  const db = getDb();
  const eventRows = await db
    .select({ id: events.id, title: events.title, startsAt: events.startsAt })
    .from(events)
    .where(isNull(events.deletedAt))
    .orderBy(desc(events.startsAt))
    .limit(30);

  const jar = await cookies();
  const selectedId = jar.get(CHECKIN_EVENT_COOKIE)?.value ?? null;
  const selected = eventRows.find((event) => event.id === selectedId) ?? null;

  const options = [...eventRows]
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .map((event) => ({
      id: event.id,
      title: event.title,
      when: formatWhen(event.startsAt),
    }));

  let arrived: { id: string; name: string; email: string; when: string; note: string }[] = [];
  let waiting: { id: string; name: string; email: string }[] = [];
  let guests: { id: string; name: string; email: string; when: string }[] = [];

  if (selected) {
    const registrations = await db
      .select({
        id: eventRegistrations.id,
        attended: eventRegistrations.attended,
        attendedAt: eventRegistrations.attendedAt,
        registeredAt: eventRegistrations.registeredAt,
        fullName: members.fullName,
        email: members.email,
      })
      .from(eventRegistrations)
      .innerJoin(members, eq(eventRegistrations.memberId, members.id))
      .where(eq(eventRegistrations.eventId, selected.id))
      .orderBy(asc(members.fullName));

    arrived = registrations
      .filter((row) => row.attended)
      .map((row) => ({
        id: row.id,
        name: row.fullName,
        email: row.email,
        when: formatWhen(row.attendedAt ?? row.registeredAt),
        note:
          row.attendedAt && Math.abs(row.registeredAt.getTime() - row.attendedAt.getTime()) < 2 * 60 * 1000
            ? "No RSVP"
            : "RSVP",
      }));
    waiting = registrations
      .filter((row) => !row.attended)
      .map((row) => ({ id: row.id, name: row.fullName, email: row.email }));

    const walkIns = await db
      .select({
        id: eventWalkIns.id,
        fullName: eventWalkIns.fullName,
        email: eventWalkIns.email,
        arrivedAt: eventWalkIns.arrivedAt,
      })
      .from(eventWalkIns)
      .where(and(eq(eventWalkIns.eventId, selected.id)))
      .orderBy(desc(eventWalkIns.arrivedAt));

    guests = walkIns.map((row) => ({
      id: row.id,
      name: row.fullName,
      email: row.email,
      when: formatWhen(row.arrivedAt),
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-lg font-bold text-ink">Event check-in</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-2">
          Scan the QR code on a membership card to mark that member as arrived. People who RSVP&apos;d and have
          not been scanned stay on the not-yet list.
        </p>
      </div>

      <CheckInEventPicker events={options} selectedId={selected?.id ?? null} />

      {selected ? (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
              <h3 className="font-display text-sm font-bold text-ink">Arrived ({arrived.length + guests.length})</h3>
              {arrived.length + guests.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Nobody scanned or logged yet.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-3">
                  {arrived.map((person) => (
                    <li key={person.id} className="text-sm">
                      <p className="font-semibold text-ink">{person.name}</p>
                      <p className="text-xs text-muted">
                        {person.email} · {person.when} · {person.note}
                      </p>
                    </li>
                  ))}
                  {guests.map((person) => (
                    <li key={person.id} className="text-sm">
                      <p className="font-semibold text-ink">{person.name}</p>
                      <p className="text-xs text-muted">
                        {person.email} · {person.when} · Guest
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
              <h3 className="font-display text-sm font-bold text-ink">Not yet ({waiting.length})</h3>
              {waiting.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Everyone who RSVP&apos;d has been checked in.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-3">
                  {waiting.map((person) => (
                    <li key={person.id} className="text-sm">
                      <p className="font-semibold text-ink">{person.name}</p>
                      <p className="text-xs text-muted">{person.email}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <WalkInForm eventId={selected.id} />
        </>
      ) : null}
    </div>
  );
}
