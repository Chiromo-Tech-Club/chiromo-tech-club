"use client";

import { useState, useTransition } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { createTransaction } from "@/actions/dashboard/transactions";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";

export interface TransactionRow {
  id: string;
  category: string;
  description: string;
  amountCents: number;
  occurredAt: string;
  recordedByName: string;
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "KES", maximumFractionDigits: 0 });
}

export function TransactionTypeTracker({
  type,
  rows,
}: {
  type: "income" | "expense";
  rows: TransactionRow[];
}) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const total = rows.reduce((sum, r) => sum + r.amountCents, 0);
  const isIncome = type === "income";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    startTransition(async () => {
      const result = await createTransaction({ type, category, description, amount: parsedAmount });
      if (result.success) {
        setCategory("");
        setDescription("");
        setAmount("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
          {isIncome ? <TrendingUp size={14} className="text-green" /> : <TrendingDown size={14} className="text-red-500" />}
          Total {isIncome ? "Income" : "Expenses"}
        </div>
        <div className={`mt-2 font-display text-2xl font-bold ${isIncome ? "text-green" : "text-red-600"}`}>
          {formatMoney(total)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
        <h3 className="mb-4 font-display text-sm font-bold text-ink">Record {isIncome ? "Income" : "an Expense"}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
          <Input placeholder="Amount (KES)" type="number" min="0" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-3" />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
          {isPending ? "Saving…" : `Add ${isIncome ? "Income" : "Expense"}`}
        </Button>
      </form>

      <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
        <h3 className="mb-4 font-display text-sm font-bold text-ink">{isIncome ? "Income" : "Expense"} Entries</h3>
        {rows.length === 0 ? (
          <p className="text-sm text-muted">Nothing recorded yet.</p>
        ) : (
          <div className="flex flex-col">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between border-b border-line py-3 last:border-0">
                <div>
                  <div className="text-sm font-medium text-ink">{r.description}</div>
                  <div className="text-[11px] text-muted">
                    {r.category} · {new Date(r.occurredAt).toLocaleDateString()} · {r.recordedByName}
                  </div>
                </div>
                <span className={`font-mono text-sm font-semibold ${isIncome ? "text-green" : "text-red-600"}`}>
                  {formatMoney(r.amountCents)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
