"use client";

import { useState, useTransition } from "react";
import { Megaphone } from "lucide-react";
import { deleteAnnouncement, postAnnouncement, updateAnnouncement } from "@/actions/dashboard/announcements";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";

export type AnnouncementAudience = "members" | "executives";

export interface AnnouncementFullItem {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  authorName: string;
  createdAt: string;
}

const fieldClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none";

function AudienceSelect({
  value,
  onChange,
}: {
  value: AnnouncementAudience;
  onChange: (value: AnnouncementAudience) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AnnouncementAudience)}
      className="mt-3 w-full rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-ink"
    >
      <option value="members">Members — everyone in the club can read this</option>
      <option value="executives">Executives only — members will not see this</option>
    </select>
  );
}

function NewAnnouncementForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AnnouncementAudience>("members");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await postAnnouncement({ title, body, audience });
      if (result.success) {
        setTitle("");
        setBody("");
        setAudience("members");
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
        className={`mt-3 ${fieldClass}`}
      />
      <AudienceSelect value={audience} onChange={setAudience} />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Posting…" : "Post Announcement"}
      </Button>
    </form>
  );
}

function AnnouncementRow({ item, canManage }: { item: AnnouncementFullItem; canManage: boolean }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState(item.body);
  const [audience, setAudience] = useState<AnnouncementAudience>(item.audience);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateAnnouncement({ id: item.id, title, body, audience });
      if (result.success) setEditing(false);
      else setError(result.error ?? "Could not save.");
    });
  }

  function remove() {
    if (!window.confirm("Delete this announcement?")) return;
    startTransition(async () => {
      const result = await deleteAnnouncement(item.id);
      if (!result.success) setError(result.error ?? "Could not delete.");
    });
  }

  if (editing) {
    return (
      <form onSubmit={save} className="border-b border-line py-4 last:border-0">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={3} className={`mt-3 ${fieldClass}`} />
        <AudienceSelect value={audience} onChange={setAudience} />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <div className="mt-3 flex gap-2">
          <Button type="submit" variant="primary" size="sm" disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="border-b border-line py-4 last:border-0">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm font-semibold text-ink">{item.title}</div>
        <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-2">
          {item.audience === "executives" ? "Executives only" : "Members"}
        </span>
      </div>
      <p className="mt-1 whitespace-pre-line text-sm text-ink-2">{item.body}</p>
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
        <span>
          {item.authorName} · {new Date(item.createdAt).toLocaleString()}
        </span>
        {canManage ? (
          <span className="flex gap-2">
            <button type="button" className="font-semibold text-sky hover:underline" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button type="button" className="font-semibold text-red-600 hover:underline" disabled={isPending} onClick={remove}>
              Delete
            </button>
          </span>
        ) : null}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function AnnouncementsBoard({
  announcements,
  canManage,
}: {
  announcements: AnnouncementFullItem[];
  canManage: boolean;
}) {
  const memberPosts = announcements.filter((a) => a.audience !== "executives");
  const execPosts = announcements.filter((a) => a.audience === "executives");

  return (
    <div className="flex flex-col gap-6">
      {canManage ? <NewAnnouncementForm /> : null}

      {canManage ? (
        <section className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
          <div className="mb-4 flex items-center gap-2">
            <Megaphone size={16} className="text-green" />
            <h3 className="font-display text-sm font-bold text-ink">Executive announcements</h3>
          </div>
          <p className="mb-3 text-xs text-muted">Only executives and administrators see these.</p>
          {execPosts.length === 0 ? (
            <p className="text-sm text-muted">Nothing posted for the team yet.</p>
          ) : (
            execPosts.map((a) => <AnnouncementRow key={a.id} item={a} canManage={canManage} />)
          )}
        </section>
      ) : null}

      <section className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <Megaphone size={16} className="text-green" />
          <h3 className="font-display text-sm font-bold text-ink">Member announcements</h3>
        </div>
        {memberPosts.length === 0 ? (
          <p className="text-sm text-muted">Nothing posted yet.</p>
        ) : (
          memberPosts.map((a) => <AnnouncementRow key={a.id} item={a} canManage={canManage} />)
        )}
      </section>
    </div>
  );
}
