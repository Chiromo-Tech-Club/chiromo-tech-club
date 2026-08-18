"use client";

import { useState, useTransition } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { createMinutes, updateMinutes } from "@/actions/dashboard/minutes";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";

export interface MinutesItem {
  id: string;
  title: string;
  meetingDate: string;
  agenda: string;
  minutes: string;
  attendees: string[];
  recordedByName: string;
}

function NewMeetingForm() {
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [agenda, setAgenda] = useState("");
  const [attendees, setAttendees] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createMinutes({
        title,
        meetingDate: meetingDate ? new Date(meetingDate).toISOString() : new Date().toISOString(),
        agenda,
        minutes: "",
        attendees: attendees
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
      });
      if (result.success) {
        setTitle("");
        setMeetingDate("");
        setAgenda("");
        setAttendees("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">New Meeting Record</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
        <Input placeholder="Meeting title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input type="datetime-local" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} required />
      </div>
      <textarea
        placeholder="Agenda — one item per line"
        value={agenda}
        onChange={(e) => setAgenda(e.target.value)}
        rows={3}
        className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
      />
      <Input
        placeholder="Attendees, comma separated"
        value={attendees}
        onChange={(e) => setAttendees(e.target.value)}
        className="mt-3"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Create Record"}
      </Button>
    </form>
  );
}

function MeetingRecord({ record }: { record: MinutesItem }) {
  const [open, setOpen] = useState(false);
  const [minutesText, setMinutesText] = useState(record.minutes);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      const result = await updateMinutes({
        id: record.id,
        agenda: record.agenda,
        minutes: minutesText,
        attendees: record.attendees,
      });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <div className="border-b border-line py-4 last:border-0">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left">
        <div>
          <div className="text-sm font-semibold text-ink">{record.title}</div>
          <div className="text-[11px] text-muted">
            {new Date(record.meetingDate).toLocaleString()} · recorded by {record.recordedByName}
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-3">
          {record.agenda && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Agenda</div>
              <p className="mt-1 whitespace-pre-line text-sm text-ink-2">{record.agenda}</p>
            </div>
          )}
          {record.attendees.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Attendees</div>
              <p className="mt-1 text-sm text-ink-2">{record.attendees.join(", ")}</p>
            </div>
          )}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Minutes</div>
            <textarea
              value={minutesText}
              onChange={(e) => setMinutesText(e.target.value)}
              rows={5}
              placeholder="Write up what happened in the meeting…"
              className="mt-1 w-full rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
            />
          </div>
          <Button variant="primary" className="self-start" disabled={isPending} onClick={handleSave}>
            {isPending ? "Saving…" : saved ? "Saved ✓" : "Save Minutes"}
          </Button>
        </div>
      )}
    </div>
  );
}

export function MinutesEditor({ records }: { records: MinutesItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      <NewMeetingForm />

      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <FileText size={16} className="text-green" />
          <h3 className="font-display text-sm font-bold text-ink">Meeting Records</h3>
        </div>
        {records.length === 0 ? (
          <p className="text-sm text-muted">No meetings recorded yet.</p>
        ) : (
          records.map((r) => <MeetingRecord key={r.id} record={r} />)
        )}
      </div>
    </div>
  );
}
