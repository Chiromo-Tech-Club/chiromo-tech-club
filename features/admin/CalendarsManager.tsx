"use client";

import { useState, useTransition } from "react";
import {
  addGoogleCalendars,
  removeGoogleCalendar,
  setGoogleCalendarActive,
} from "@/actions/admin/calendars";
import { Button } from "@/components/alignui/button";
import type { GoogleCalendarSource } from "@/lib/calendar/sources";

export function CalendarsManager({ initial }: { initial: GoogleCalendarSource[] }) {
  const [label, setLabel] = useState("");
  const [calendarSrc, setCalendarSrc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await addGoogleCalendars({
        label: label.trim() || undefined,
        calendarSrc,
      });
      if (!res.success) {
        setError(res.error ?? "Could not save.");
        return;
      }
      setLabel("");
      setCalendarSrc("");
      setMessage("Calendar source(s) added to the joint embed.");
    });
  }

  function handleToggle(id: string, isActive: boolean) {
    setPendingId(id);
    setError(null);
    startTransition(async () => {
      const res = await setGoogleCalendarActive(id, isActive);
      if (!res.success) setError(res.error ?? "Update failed.");
      setPendingId(null);
    });
  }

  function handleRemove(id: string) {
    setPendingId(id);
    setError(null);
    startTransition(async () => {
      const res = await removeGoogleCalendar(id);
      if (!res.success) setError(res.error ?? "Remove failed.");
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleAdd}
        className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-5 space-y-4"
      >
        <div>
          <h2 className="font-display text-base font-bold text-ink">Add joint calendar email(s)</h2>
          <p className="mt-1 text-xs text-muted">
            Paste one Google Calendar email/ID, or several separated by commas. Each becomes a layer
            in the shared club embed. Make each calendar public (or shared) so members can see it.
          </p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-ink-2">Label (optional)</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Training workshops"
            className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-sky"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-ink-2">Calendar email or ID</span>
          <textarea
            value={calendarSrc}
            onChange={(e) => setCalendarSrc(e.target.value)}
            required
            rows={3}
            placeholder={"ctc.uonbi@gmail.com\ntraining@example.com, workshops@example.com"}
            className="w-full rounded-lg border border-line bg-cream px-3 py-2 font-mono text-sm text-ink outline-none focus:border-sky"
          />
        </label>
        {error && <p className="text-sm text-pink">{error}</p>}
        {message && <p className="text-sm text-green">{message}</p>}
        <Button type="submit" disabled={isPending || !calendarSrc.trim()}>
          {isPending ? "Saving…" : "Add to joint calendar"}
        </Button>
      </form>

      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-5">
        <h2 className="mb-3 font-display text-base font-bold text-ink">Joint sources</h2>
        {initial.length === 0 ? (
          <p className="text-sm text-muted">No calendars yet — add the club email above.</p>
        ) : (
          <ul className="divide-y divide-line">
            {initial.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{row.label}</p>
                  <p className="truncate font-mono text-xs text-muted">{row.calendarSrc}</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {row.isActive ? "Active in embed" : "Hidden from embed"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isPending && pendingId === row.id}
                    onClick={() => handleToggle(row.id, !row.isActive)}
                  >
                    {row.isActive ? "Hide" : "Show"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isPending && pendingId === row.id}
                    onClick={() => handleRemove(row.id)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
