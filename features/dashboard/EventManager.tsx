"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { CalendarPlus, MapPin, Pencil, Trash2, ExternalLink, ImagePlus } from "lucide-react";
import { createEvent, updateEvent, deleteEvent } from "@/actions/dashboard/events";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { ROUTES } from "@/constants/routes";

export interface EventManagerItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  startsAt: string;
  location: string;
  capacity: number | null;
  coverImageUrl?: string | null;
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EventForm({
  initial,
  onDone,
}: {
  initial?: EventManagerItem;
  onDone?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startsAt, setStartsAt] = useState(initial ? toLocalInputValue(initial.startsAt) : "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [capacity, setCapacity] = useState(initial?.capacity ? String(initial.capacity) : "");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(initial?.coverImageUrl ?? null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onPickPoster(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Poster must be PNG, JPG, or WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Poster must be under 5 MB.");
      return;
    }
    setError(null);
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      if (initial) formData.set("id", initial.id);
      formData.set("title", title);
      formData.set("description", description);
      formData.set(
        "startsAt",
        startsAt ? new Date(startsAt).toISOString() : new Date().toISOString(),
      );
      formData.set("location", location);
      if (capacity) formData.set("capacity", capacity);
      if (posterFile) formData.set("poster", posterFile);

      const result = initial ? await updateEvent(formData) : await createEvent(formData);

      if (result.success) {
        if (!initial) {
          setTitle("");
          setDescription("");
          setStartsAt("");
          setLocation("");
          setCapacity("");
          setPosterFile(null);
          setPosterPreview(null);
          if (fileRef.current) fileRef.current.value = "";
        } else {
          setPosterFile(null);
        }
        onDone?.();
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">
        {initial ? "Edit event" : "Create an event"}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
        <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <Input
          placeholder="Capacity (optional)"
          type="number"
          min="1"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
      </div>
      <textarea
        placeholder="What's this event about? (shown on the public event page)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        rows={4}
        className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
      />

      <div className="mt-4 rounded-xl border border-dashed border-line bg-cream/40 p-4">
        <p className="text-xs font-semibold text-ink">Event poster</p>
        <p className="mt-0.5 text-[11px] text-muted">PNG, JPG or WebP · max 5 MB. Shown on the public events page.</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="relative h-28 w-44 overflow-hidden rounded-xl border border-line bg-surface">
            {posterPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={posterPreview} alt="Event poster preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted">
                <ImagePlus size={20} />
                <span className="text-[10px]">No poster yet</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={onPickPoster}
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
              <ImagePlus size={14} /> {posterPreview ? "Change poster" : "Upload poster"}
            </Button>
            {posterFile && (
              <p className="text-[11px] text-muted">
                Selected: <span className="font-medium text-ink">{posterFile.name}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? "Saving…" : initial ? "Save changes" : "Create event"}
        </Button>
        {initial && onDone && (
          <Button type="button" variant="ghost" disabled={isPending} onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export function EventManager({ events }: { events: EventManagerItem[] }) {
  const sorted = [...events].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Delete this event? Members will no longer see it.")) return;
    setPendingId(id);
    startTransition(async () => {
      await deleteEvent(id);
      setPendingId(null);
      if (editingId === id) setEditingId(null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-muted">
        Create CTC events like Luma — upload a poster, then members register on the public event page.
      </p>
      <EventForm />

      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <CalendarPlus size={16} className="text-green" />
          <h3 className="font-display text-sm font-bold text-ink">All events</h3>
        </div>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted">No events yet.</p>
        ) : (
          sorted.map((e) =>
            editingId === e.id ? (
              <div key={e.id} className="mb-4">
                <EventForm initial={e} onDone={() => setEditingId(null)} />
              </div>
            ) : (
              <div key={e.id} className="border-b border-line py-3.5 last:border-0">
                <div className="flex flex-wrap items-start gap-3">
                  {e.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.coverImageUrl}
                      alt=""
                      className="h-16 w-24 shrink-0 rounded-lg border border-line object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-line bg-cream text-[10px] text-muted">
                      No poster
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-ink">{e.title}</div>
                        <p className="mt-1 text-xs text-ink-2 line-clamp-3">{e.description}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                          <span className="font-mono text-green">{new Date(e.startsAt).toLocaleString()}</span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={11} /> {e.location}
                          </span>
                          {e.capacity ? <span>· Capacity {e.capacity}</span> : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Link
                          href={ROUTES.event(e.slug)}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-[11px] font-semibold text-ink hover:bg-cream-2"
                        >
                          View <ExternalLink size={11} />
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isPending && pendingId === e.id}
                          onClick={() => setEditingId(e.id)}
                        >
                          <Pencil size={12} /> Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isPending && pendingId === e.id}
                          onClick={() => handleDelete(e.id)}
                        >
                          <Trash2 size={12} /> {isPending && pendingId === e.id ? "…" : "Delete"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ),
          )
        )}
      </div>
    </div>
  );
}
