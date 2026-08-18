"use client";

import { useMemo, useState, useTransition } from "react";
import { BookOpen, ExternalLink, Trash2 } from "lucide-react";
import { addResource, removeResource } from "@/actions/dashboard/resources";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";

export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  topic: string;
  description: string | null;
}

function NewResourceForm() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addResource({ title, url, topic, description });
      if (result.success) {
        setTitle("");
        setUrl("");
        setTopic("");
        setDescription("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">Add a Resource</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input placeholder="Title (e.g. 'Intro to PyTorch')" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input placeholder="Topic (e.g. AI/ML, Cloud, Robotics)" value={topic} onChange={(e) => setTopic(e.target.value)} required />
      </div>
      <Input placeholder="URL" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required className="mt-3" />
      <textarea
        placeholder="What will members learn from this? (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="mt-3 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Add Resource"}
      </Button>
    </form>
  );
}

function ResourceRow({ resource }: { resource: ResourceItem }) {
  const [isPending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);

  function handleRemove() {
    startTransition(async () => {
      const result = await removeResource({ id: resource.id });
      if (result.success) setRemoved(true);
    });
  }

  if (removed) return null;

  return (
    <div className="flex items-start justify-between gap-3 border-b border-line py-3 last:border-0">
      <div className="min-w-0">
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-green"
        >
          {resource.title}
          <ExternalLink size={12} className="flex-none text-muted" />
        </a>
        {resource.description && <p className="mt-0.5 text-xs text-muted">{resource.description}</p>}
      </div>
      <button
        onClick={handleRemove}
        disabled={isPending}
        className="flex-none rounded-lg p-1.5 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
        aria-label="Remove resource"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function ResourceLibrary({ resources }: { resources: ResourceItem[] }) {
  const [filter, setFilter] = useState<string | null>(null);

  const topics = useMemo(() => Array.from(new Set(resources.map((r) => r.topic))).sort(), [resources]);
  const visible = filter ? resources.filter((r) => r.topic === filter) : resources;
  const grouped = useMemo(() => {
    const map = new Map<string, ResourceItem[]>();
    for (const r of visible) {
      const list = map.get(r.topic) ?? [];
      list.push(r);
      map.set(r.topic, list);
    }
    return map;
  }, [visible]);

  return (
    <div className="flex flex-col gap-6">
      <NewResourceForm />

      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-green" />
            <h3 className="font-display text-sm font-bold text-ink">Resource Library</h3>
          </div>
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilter(null)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${!filter ? "bg-green text-white" : "bg-cream-2 text-ink-2"}`}
              >
                All
              </button>
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${filter === t ? "bg-green text-white" : "bg-cream-2 text-ink-2"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {resources.length === 0 ? (
          <p className="text-sm text-muted">No resources added yet.</p>
        ) : (
          Array.from(grouped.entries()).map(([topic, items]) => (
            <div key={topic} className="mb-5 last:mb-0">
              {!filter && <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{topic}</div>}
              {items.map((r) => (
                <ResourceRow key={r.id} resource={r} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
