"use client";

import { useMemo, useState, useTransition } from "react";
import { FolderOpen, ExternalLink, Search } from "lucide-react";
import { addDocument } from "@/actions/dashboard/documents";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";

export interface DocumentItem {
  id: string;
  title: string;
  url: string;
  category: string;
  uploadedByName: string;
  createdAt: string;
}

function NewDocumentForm() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addDocument({ title, url, category });
      if (result.success) {
        setTitle("");
        setUrl("");
        setCategory("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">Link a Document</h3>
      <p className="mb-3 text-xs text-muted">
        Paste a link (Google Drive, Docs, Sheets, etc.) — file uploads aren&apos;t wired up yet.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
        <Input placeholder="Document title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input placeholder="Category (e.g. Finance, Legal)" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <Input placeholder="URL" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required className="mt-3" />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Add Document"}
      </Button>
    </form>
  );
}

export function DocumentRepository({
  documents,
  title = "Recent Documents",
  showSearch = false,
  showForm = true,
}: {
  documents: DocumentItem[];
  title?: string;
  showSearch?: boolean;
  showForm?: boolean;
}) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((d) => d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q) || d.uploadedByName.toLowerCase().includes(q));
  }, [documents, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, DocumentItem[]>();
    for (const d of visible) {
      const list = map.get(d.category) ?? [];
      list.push(d);
      map.set(d.category, list);
    }
    return map;
  }, [visible]);

  return (
    <div className="flex flex-col gap-6">
      {showForm && <NewDocumentForm />}

      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderOpen size={16} className="text-green" />
            <h3 className="font-display text-sm font-bold text-ink">{title}</h3>
          </div>
          {showSearch && (
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documents…"
                className="w-56 rounded-full border border-line bg-cream py-2 pl-8 pr-3 text-sm text-ink placeholder:text-muted focus:outline-none"
              />
            </div>
          )}
        </div>
        {visible.length === 0 ? (
          <p className="text-sm text-muted">{query ? `No documents match "${query}".` : "No documents linked yet."}</p>
        ) : (
          Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category} className="mb-5 last:mb-0">
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{category}</div>
              {items.map((d) => (
                <div key={d.id} className="flex items-center justify-between border-b border-line py-2.5 last:border-0">
                  <a href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-green">
                    {d.title}
                    <ExternalLink size={11} className="text-muted" />
                  </a>
                  <span className="text-[11px] text-muted">{d.uploadedByName}</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
