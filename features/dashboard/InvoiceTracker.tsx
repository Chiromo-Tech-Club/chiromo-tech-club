"use client";

import { useState, useTransition } from "react";
import { Receipt } from "lucide-react";
import { createInvoice, updateInvoiceStatus } from "@/actions/dashboard/invoices";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { cn } from "@/lib/utils/cn";

export interface InvoiceItem {
  id: string;
  clientName: string;
  description: string;
  amountCents: number;
  dueDate: string | null;
  status: "unpaid" | "paid" | "overdue";
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "KES", maximumFractionDigits: 0 });
}

const STATUS_STYLES: Record<InvoiceItem["status"], string> = {
  unpaid: "bg-cream-2 text-ink-2",
  paid: "bg-green/10 text-green",
  overdue: "bg-red-50 text-red-600",
};

function NewInvoiceForm() {
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
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
      const result = await createInvoice({
        clientName,
        description,
        amount: parsedAmount,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      if (result.success) {
        setClientName("");
        setDescription("");
        setAmount("");
        setDueDate("");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
      <h3 className="mb-4 font-display text-sm font-bold text-ink">New Invoice</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input placeholder="Client / payer" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
        <Input placeholder="Amount (KES)" type="number" min="0" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-3" />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" variant="primary" disabled={isPending} className="mt-3">
        {isPending ? "Saving…" : "Add Invoice"}
      </Button>
    </form>
  );
}

function InvoiceRow({ invoice }: { invoice: InvoiceItem }) {
  const [isPending, startTransition] = useTransition();

  function setStatus(status: InvoiceItem["status"]) {
    startTransition(async () => {
      await updateInvoiceStatus({ id: invoice.id, status });
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3.5 last:border-0">
      <div>
        <div className="text-sm font-semibold text-ink">{invoice.clientName}</div>
        <div className="text-xs text-ink-2">{invoice.description}</div>
        {invoice.dueDate && <div className="text-[11px] text-muted">Due {new Date(invoice.dueDate).toLocaleDateString()}</div>}
      </div>
      <div className="flex flex-none items-center gap-3">
        <span className="font-mono text-sm font-semibold text-ink">{formatMoney(invoice.amountCents)}</span>
        <select
          value={invoice.status}
          onChange={(e) => setStatus(e.target.value as InvoiceItem["status"])}
          disabled={isPending}
          className={cn("rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold capitalize", STATUS_STYLES[invoice.status])}
        >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
    </div>
  );
}

export function InvoiceTracker({ invoices }: { invoices: InvoiceItem[] }) {
  const outstanding = invoices.filter((i) => i.status !== "paid").reduce((sum, i) => sum + i.amountCents, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
          <Receipt size={14} className="text-green" /> Outstanding
        </div>
        <div className="mt-2 font-display text-2xl font-bold text-ink">{formatMoney(outstanding)}</div>
      </div>

      <NewInvoiceForm />

      <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
        <h3 className="mb-2 font-display text-sm font-bold text-ink">All Invoices</h3>
        {invoices.length === 0 ? <p className="text-sm text-muted">No invoices yet.</p> : invoices.map((i) => <InvoiceRow key={i.id} invoice={i} />)}
      </div>
    </div>
  );
}
