"use client";

import { useState, useTransition } from "react";
import { TrendingUp, TrendingDown, Pencil, Trash2 } from "lucide-react";
import { createTransaction, updateTransaction, deleteTransaction } from "@/actions/dashboard/transactions";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";

export interface TransactionRow {
  id: string;
  category: string;
  partyName: string | null;
  description: string;
  amountCents: number;
  occurredAt: string;
  recordedByName: string;
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  });
}

function TransactionForm({
  type,
  initial,
  onDone,
}: {
  type: "income" | "expense";
  initial?: TransactionRow;
  onDone?: () => void;
}) {
  const isIncome = type === "income";
  const [partyName, setPartyName] = useState(initial?.partyName ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amountCents / 100) : "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    startTransition(async () => {
      const payload = {
        type,
        partyName,
        category,
        description,
        amount: parsedAmount,
        occurredAt: initial?.occurredAt,
      };
      const result = initial
        ? await updateTransaction({ id: initial.id, ...payload })
        : await createTransaction(payload);

      if (result.success) {
        if (!initial) {
          setPartyName("");
          setCategory("");
          setDescription("");
          setAmount("");
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
        {initial ? `Edit ${isIncome ? "income" : "expense"}` : `Record ${isIncome ? "Income" : "an Expense"}`}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          placeholder={
            isIncome
              ? "Payer / source name (e.g. Safaricom, Member fees)"
              : "Payee / vendor name (e.g. Venue, Catering)"
          }
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
        />
        <Input
          placeholder={isIncome ? "Category (e.g. Sponsorship, Dues)" : "Category (e.g. Venue, Transport)"}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <Input
          placeholder="Amount (KES)"
          type="number"
          min="0"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Input
          placeholder={isIncome ? "Description (what was received)" : "Description (what was paid for)"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending
            ? "Saving…"
            : initial
              ? "Save changes"
              : `Add ${isIncome ? "Income" : "Expense"}`}
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

export function TransactionTypeTracker({
  type,
  rows,
}: {
  type: "income" | "expense";
  rows: TransactionRow[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = rows.reduce((sum, r) => sum + r.amountCents, 0);
  const isIncome = type === "income";

  function handleDelete(id: string, label: string) {
    if (!confirm(`Delete this ${isIncome ? "income" : "expense"} entry${label ? ` (“${label}”)` : ""}?`)) return;
    setPendingId(id);
    startTransition(async () => {
      await deleteTransaction(id);
      setPendingId(null);
      if (editingId === id) setEditingId(null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
          {isIncome ? (
            <TrendingUp size={14} className="text-green" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )}
          Total {isIncome ? "Income" : "Expenses"}
        </div>
        <div className={`mt-2 font-display text-2xl font-bold ${isIncome ? "text-green" : "text-red-600"}`}>
          {formatMoney(total)}
        </div>
      </div>

      <TransactionForm type={type} />

      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <h3 className="mb-4 font-display text-sm font-bold text-ink">
          {isIncome ? "Income" : "Expense"} Entries
        </h3>
        {rows.length === 0 ? (
          <p className="text-sm text-muted">Nothing recorded yet.</p>
        ) : (
          <div className="flex flex-col">
            {rows.map((r) =>
              editingId === r.id ? (
                <div key={r.id} className="mb-3">
                  <TransactionForm type={type} initial={r} onDone={() => setEditingId(null)} />
                </div>
              ) : (
                <div
                  key={r.id}
                  className="flex flex-wrap items-start justify-between gap-2 border-b border-line py-3 last:border-0"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink">{r.description}</div>
                    {r.partyName && (
                      <div className="mt-0.5 text-xs font-semibold text-ink-2">
                        {isIncome ? "From" : "To"}: {r.partyName}
                      </div>
                    )}
                    <div className="text-[11px] text-muted">
                      {r.category} · {new Date(r.occurredAt).toLocaleDateString()} · {r.recordedByName}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-mono text-sm font-semibold ${isIncome ? "text-green" : "text-red-600"}`}
                    >
                      {formatMoney(r.amountCents)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isPending && pendingId === r.id}
                      onClick={() => setEditingId(r.id)}
                    >
                      <Pencil size={12} /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isPending && pendingId === r.id}
                      onClick={() => handleDelete(r.id, r.partyName || r.description)}
                      className="text-red-600"
                    >
                      <Trash2 size={12} /> {isPending && pendingId === r.id ? "…" : "Delete"}
                    </Button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
