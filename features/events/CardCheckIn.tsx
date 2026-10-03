"use client";

import { useEffect, useState, useTransition } from "react";
import { markMemberArrived } from "@/actions/dashboard/check-in";
import { Button } from "@/components/alignui/button";

export function AutoArrive({ eventId, memberId }: { eventId: string; memberId: string }) {
  const [message, setMessage] = useState("Checking this card in…");
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    markMemberArrived({ eventId, memberId }).then((result) => {
      if (cancelled) return;
      setOk(result.success);
      setMessage(result.success ? (result.detail ?? "Marked as arrived.") : (result.error ?? "Could not check this member in."));
    });
    return () => {
      cancelled = true;
    };
  }, [eventId, memberId]);

  return <p className={`text-sm ${ok === false ? "text-red-600" : "text-ink-2"}`}>{message}</p>;
}

export function ManualArrive({
  memberId,
  events,
}: {
  memberId: string;
  events: { id: string; label: string }[];
}) {
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await markMemberArrived({ eventId, memberId });
      if (result.success) setMessage(result.detail ?? "Marked as arrived.");
      else setError(result.error ?? "Could not check this member in.");
    });
  }

  if (events.length === 0) {
    return <p className="text-sm text-muted">There is no event to check this member into.</p>;
  }

  return (
    <form onSubmit={submit} className="mt-4">
      <p className="text-sm text-ink-2">Pick the event, then mark this member as arrived.</p>
      <select
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        className="mt-3 w-full rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-ink"
      >
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      {message ? <p className="mt-2 text-sm text-ink-2">{message}</p> : null}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Mark arrived"}
      </Button>
    </form>
  );
}
