"use client";

import { useState, useTransition } from "react";
import { Megaphone } from "lucide-react";
import { postAnnouncement } from "@/actions/dashboard/announcements";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";

export interface AnnouncementFullItem {
  id: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
}

function NewAnnouncementForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await postAnnouncement({ title, body });
      if (result.success) {
        setTitle("");
        setBody("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">Post an Announcement</h3>
      <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea
        placeholder="What's the announcement?"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={3}
        className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Posting…" : "Post Announcement"}
      </Button>
    </form>
  );
}

export function AnnouncementsBoard({ announcements }: { announcements: AnnouncementFullItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      <NewAnnouncementForm />

      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <Megaphone size={16} className="text-green" />
          <h3 className="font-display text-sm font-bold text-ink">All Announcements</h3>
        </div>
        {announcements.length === 0 ? (
          <p className="text-sm text-muted">Nothing posted yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="border-b border-line py-4 last:border-0">
              <div className="text-sm font-semibold text-ink">{a.title}</div>
              <p className="mt-1 whitespace-pre-line text-sm text-ink-2">{a.body}</p>
              <div className="mt-1.5 text-[11px] text-muted">
                {a.authorName} · {new Date(a.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
