"use client";

import { useState, useTransition } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { createTransaction } from "@/actions/dashboard/transactions";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { cn } from "@/lib/utils/cn";

export interface TransactionItem {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amountCents: number;
  occurredAt: string;
  recordedByName: string;
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "KES", maximumFractionDigits: 0 });
}

function NewTransactionForm() {
  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
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
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">Record a Transaction</h3>

      <div className="mb-3 flex gap-2">
        {(["income", "expense"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "flex-1 rounded-xl border py-2 text-sm font-semibold capitalize transition-colors",
              type === t ? (t === "income" ? "border-green bg-green/10 text-green" : "border-red-300 bg-red-50 text-red-600") : "border-line text-ink-2",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input placeholder="Category (e.g. Sponsorship, Venue)" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <Input placeholder="Amount (KES)" type="number" min="0" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>
      <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-3" />

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Add Transaction"}
      </Button>
    </form>
  );
}

export function BudgetPlanner({ transactions }: { transactions: TransactionItem[] }) {
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amountCents, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amountCents, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <Wallet size={14} className="text-green" /> Balance
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-ink">{formatMoney(balance)}</div>
        </div>
        <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <TrendingUp size={14} className="text-green" /> Total Income
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-green">{formatMoney(totalIncome)}</div>
        </div>
        <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <TrendingDown size={14} className="text-red-500" /> Total Expenses
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-red-600">{formatMoney(totalExpense)}</div>
        </div>
      </div>

      <NewTransactionForm />

      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <h3 className="mb-4 font-display text-sm font-bold text-ink">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted">No transactions recorded yet.</p>
        ) : (
          <div className="flex flex-col">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between border-b border-line py-3 last:border-0">
                <div>
                  <div className="text-sm font-medium text-ink">{t.description}</div>
                  <div className="text-[11px] text-muted">
                    {t.category} · {new Date(t.occurredAt).toLocaleDateString()} · {t.recordedByName}
                  </div>
                </div>
                <span className={cn("font-mono text-sm font-semibold", t.type === "income" ? "text-green" : "text-red-600")}>
                  {t.type === "income" ? "+" : "−"}
                  {formatMoney(t.amountCents)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
