"use client";

import { useState, useTransition } from "react";
import { CalendarPlus, MapPin } from "lucide-react";
import { createEvent } from "@/actions/dashboard/events";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";

export interface EventManagerItem {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  location: string;
  capacity: number | null;
}

function NewEventForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createEvent({
        title,
        description,
        startsAt: startsAt ? new Date(startsAt).toISOString() : new Date().toISOString(),
        location,
        capacity: capacity ? Number(capacity) : null,
      });
      if (result.success) {
        setTitle("");
        setDescription("");
        setStartsAt("");
        setLocation("");
        setCapacity("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">Create an Event</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
        <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <Input placeholder="Capacity (optional)" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
      </div>
      <textarea
        placeholder="What's this event about?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        rows={3}
        className="mt-3 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Creating…" : "Create Event"}
      </Button>
    </form>
  );
}

export function EventManager({ events }: { events: EventManagerItem[] }) {
  const sorted = [...events].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return (
    <div className="flex flex-col gap-6">
      <NewEventForm />

      <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <CalendarPlus size={16} className="text-green" />
          <h3 className="font-display text-sm font-bold text-ink">All Events</h3>
        </div>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted">No events yet.</p>
        ) : (
          sorted.map((e) => (
            <div key={e.id} className="border-b border-line py-3.5 last:border-0">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-ink">{e.title}</div>
                <span className="font-mono text-[11px] text-green">{new Date(e.startsAt).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-xs text-ink-2">{e.description}</p>
              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted">
                <MapPin size={11} /> {e.location}
                {e.capacity && <span>· Capacity {e.capacity}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
