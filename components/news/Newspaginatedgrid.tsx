"use client";

import { useState } from "react";
import type { NewsArticle } from "@/lib/news";
import { NewsCard } from "./NewsCard";

export function NewsPaginatedGrid({
  articles,
  perPage = 6,
}: {
  articles: NewsArticle[];
  perPage?: number;
}) {
  const [page, setPage] = useState(0);

  if (articles.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line bg-cream-2 px-6 py-10 text-center">
        <p className="text-paragraph-sm text-muted">No more stories right now — check back soon.</p>
      </div>
    );
  }

  const pageCount = Math.max(1, Math.ceil(articles.length / perPage));
  const start = page * perPage;
  const visible = articles.slice(start, start + perPage);

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((a) => (
          <NewsCard key={a.id} article={a} />
        ))}
      </div>

      {pageCount > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-2 transition-colors hover:border-sky/40 hover:text-sky disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink-2"
            aria-label="Previous page"
          >
            ‹
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Page ${i + 1}`}
                className={`h-2 rounded-pill transition-all duration-300 ${
                  i === page ? "w-5 bg-sky" : "w-2 bg-line-strong hover:bg-sky/50"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-2 transition-colors hover:border-sky/40 hover:text-sky disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink-2"
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}