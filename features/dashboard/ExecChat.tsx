"use client";

import { useState, useTransition } from "react";
import { MessageSquare } from "lucide-react";
import { postMessage } from "@/actions/dashboard/chat";
import { Button } from "@/components/alignui/button";

export interface ChatMessageItem {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
}

export function ExecChat({ messages }: { messages: ChatMessageItem[] }) {
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await postMessage({ body });
      if (result.success) {
        setBody("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare size={16} className="text-green" />
        <h3 className="font-display text-sm font-bold text-ink">Executive Chat</h3>
      </div>
      <p className="mb-4 text-xs text-muted">
        Shared with every exec and admin. Updates when you send a message or reload — not instant/live yet.
      </p>

      <div className="mb-4 flex max-h-[420px] flex-col gap-3 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-sm text-muted">No messages yet — say hello.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="rounded-xl bg-cream px-4 py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs font-semibold text-ink">{m.authorName}</span>
                <span className="text-[10px] text-muted">{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-0.5 whitespace-pre-line text-sm text-ink-2">{m.body}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message…"
          className="flex-1 rounded-full border border-line bg-cream px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
        />
        <Button type="submit" variant="primary" disabled={isPending || !body.trim()}>
          {isPending ? "…" : "Send"}
        </Button>
      </form>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
