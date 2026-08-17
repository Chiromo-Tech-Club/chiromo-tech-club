"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { MessageSquare, Pencil, Check, X } from "lucide-react";
import {
  postMessage,
  editMessage,
  setTyping,
  getChatUpdates,
  type ChatMessageItem,
} from "@/actions/dashboard/chat";
import { Button } from "@/components/alignui/button";

const TYPING_IDLE_MS = 2000;
const POLL_MS = 3000;
const GROUP_WINDOW_MS = 5 * 60 * 1000;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function humanizeTitle(title: string | null): string | null {
  if (!title) return null;
  return title
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function ExecChat({
  messages: initialMessages,
  currentUserId,
}: {
  messages: ChatMessageItem[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const update = await getChatUpdates();
        if (cancelled) return;
        setMessages(update.messages);
        setTypingNames(update.typingMemberNames);
      } catch {
        // skip a failed poll
      }
    };
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  const notifyTyping = useCallback((isTyping: boolean) => {
    if (isTypingRef.current === isTyping) return;
    isTypingRef.current = isTyping;
    setTyping({ isTyping }).catch(() => {});
  }, []);

  function handleInputChange(value: string) {
    setBody(value);
    notifyTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => notifyTyping(false), TYPING_IDLE_MS);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = body;
    startTransition(async () => {
      const result = await postMessage({ body: value });
      if (result.success) {
        setBody("");
        notifyTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  function startEdit(m: ChatMessageItem) {
    setEditingId(m.id);
    setEditBody(m.body);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditBody("");
  }

  function saveEdit(id: string) {
    const value = editBody;
    startTransition(async () => {
      const result = await editMessage({ id, body: value });
      if (result.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, body: value, editedAt: new Date().toISOString() } : m))
        );
        setEditingId(null);
      } else {
        setError(result.error ?? "Couldn't save edit.");
      }
    });
  }

  const groups: ChatMessageItem[][] = [];
  for (const m of messages) {
    const lastGroup = groups[groups.length - 1];
    const lastMsg = lastGroup?.[lastGroup.length - 1];
    const sameAuthor = lastMsg?.authorId === m.authorId;
    const withinWindow =
      lastMsg && new Date(m.createdAt).getTime() - new Date(lastMsg.createdAt).getTime() < GROUP_WINDOW_MS;
    if (sameAuthor && withinWindow) {
      lastGroup.push(m);
    } else {
      groups.push([m]);
    }
  }

  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare size={16} className="text-green" />
        <h3 className="font-display text-sm font-bold text-ink">Executive Chat</h3>
      </div>
      <p className="mb-4 text-xs text-muted">Shared with every exec and admin.</p>

      <div ref={scrollRef} className="mb-2 flex max-h-[420px] flex-col gap-4 overflow-y-auto pr-1">
        {groups.length === 0 ? (
          <p className="text-sm text-muted">No messages yet — say hello.</p>
        ) : (
          groups.map((group, gi) => {
            const first = group[0];
            const isOwn = first.authorId === currentUserId;
            const title = humanizeTitle(first.authorTitle);

            return (
              <div key={gi} className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar — shown on BOTH sides now; flex-row-reverse above mirrors it to the right for your own messages */}
                <div className="mt-5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green/10 text-xs font-semibold text-green">
                  {first.authorAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={first.authorAvatarUrl} alt={first.authorName} className="h-full w-full object-cover" />
                  ) : (
                    initials(first.authorName)
                  )}
                </div>

                <div className={`flex max-w-[75%] flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
                  <div className={`flex items-baseline gap-2 px-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs font-semibold text-ink">
                      {isOwn ? "You" : first.authorName}
                    </span>
                    {title && (
                      <span className="text-[10px] font-medium uppercase tracking-wide text-green">
                        {title}
                      </span>
                    )}
                    <span className="text-[10px] text-muted">
                      {new Date(first.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {group.map((m) => (
                    <div
                      key={m.id}
                      className={`group relative rounded-2xl px-4 py-2.5 ${
                        isOwn ? "bg-green text-white" : "bg-cream text-ink-2"
                      }`}
                    >
                      {editingId === m.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            autoFocus
                            className={`min-w-[160px] flex-1 rounded-full border-none bg-white/20 px-3 py-1 text-sm outline-none ${
                              isOwn ? "text-white placeholder:text-white/70" : "text-ink"
                            }`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(m.id);
                              if (e.key === "Escape") cancelEdit();
                            }}
                          />
                          <button type="button" onClick={() => saveEdit(m.id)} className="shrink-0 rounded-full p-1 hover:bg-white/20" aria-label="Save edit">
                            <Check size={14} />
                          </button>
                          <button type="button" onClick={cancelEdit} className="shrink-0 rounded-full p-1 hover:bg-white/20" aria-label="Cancel edit">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-line text-sm">{m.body}</p>
                          {m.editedAt && (
                            <span className={`text-[10px] ${isOwn ? "text-white/70" : "text-muted"}`}>(edited)</span>
                          )}
                          {isOwn && (
                            <button
                              type="button"
                              onClick={() => startEdit(m)}
                              className="absolute -left-6 top-1/2 hidden -translate-y-1/2 rounded-full p-1 text-muted hover:bg-cream group-hover:block"
                              aria-label="Edit message"
                            >
                              <Pencil size={12} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {typingNames.length > 0 && (
        <p className="mb-2 flex items-center gap-1 px-1 text-xs italic text-muted">
          {formatTypingLabel(typingNames)}
          <span className="inline-flex gap-0.5">
            <span className="h-1 w-1 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-muted" />
          </span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={body}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={() => notifyTyping(false)}
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

function formatTypingLabel(names: string[]): string {
  if (names.length === 1) return `${names[0]} is typing`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing`;
  return `${names[0]} and ${names.length - 1} others are typing`;
}