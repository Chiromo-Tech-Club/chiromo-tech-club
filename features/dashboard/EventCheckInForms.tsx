"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clearCheckInEvent, logWalkIn, selectCheckInEvent } from "@/actions/dashboard/check-in";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";

export interface CheckInEventOption {
  id: string;
  title: string;
  when: string;
}

function localNowValue() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CheckInEventPicker({
  events,
  selectedId,
}: {
  events: CheckInEventOption[];
  selectedId: string | null;
}) {
  const router = useRouter();
  const [eventId, setEventId] = useState(selectedId ?? events[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function choose(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await selectCheckInEvent(eventId);
      if (!result.success) setError(result.error ?? "Could not select that event.");
      else router.refresh();
    });
  }

  function clear() {
    startTransition(async () => {
      await clearCheckInEvent();
      router.refresh();
    });
  }

  return (
    <form onSubmit={choose} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="font-display text-sm font-bold text-ink">Event at the door</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">
        Choose the event, then scan membership cards with the phone camera. Stay signed in on the browser
        that the camera opens, usually Safari or Chrome on this phone. The scan marks that member as arrived
        for the event you picked.
      </p>
      <select
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        className="mt-4 w-full rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-ink"
        required
      >
        {events.length === 0 ? <option value="">No events yet</option> : null}
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.title} — {event.when}
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={isPending || !eventId}>
          {isPending ? "Saving…" : "Use this event"}
        </Button>
        {selectedId ? (
          <Button type="button" variant="ghost" disabled={isPending} onClick={clear}>
            Choose a different event
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function WalkInForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [arrivedAt, setArrivedAt] = useState(localNowValue);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await logWalkIn({
        eventId,
        fullName,
        email,
        arrivedAt: new Date(arrivedAt).toISOString(),
      });
      if (!result.success) {
        setError(result.error ?? "Could not save this guest.");
        return;
      }
      setFullName("");
      setEmail("");
      setArrivedAt(localNowValue());
      setMessage("Guest saved on the attendance list.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="font-display text-sm font-bold text-ink">Someone without a membership card</h3>
      <p className="mt-2 text-sm text-ink-2">Write their name, email, and the time they arrived.</p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input type="email" placeholder="School or personal email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="datetime-local" value={arrivedAt} onChange={(e) => setArrivedAt(e.target.value)} required />
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      {message ? <p className="mt-2 text-xs text-green">{message}</p> : null}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Log arrival"}
      </Button>
    </form>
  );
}
