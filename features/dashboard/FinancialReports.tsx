"use client";

import { BarChart3, Download } from "lucide-react";
import { Button } from "@/components/alignui/button";

export interface MonthlySummary {
  month: string; // "2026-01"
  incomeCents: number;
  expenseCents: number;
}

export interface FinancialReportLine {
  occurredAt: string;
  type: "income" | "expense";
  partyName: string | null;
  category: string;
  description: string;
  amountCents: number;
  recordedByName: string;
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  });
}

function formatMonth(month: string) {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function downloadCsv(filename: string, rows: string[][]) {
  const content = rows.map((row) => row.map((cell) => csvEscape(String(cell ?? ""))).join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function FinancialReports({
  summaries,
  lines = [],
}: {
  summaries: MonthlySummary[];
  lines?: FinancialReportLine[];
}) {
  const sorted = [...summaries].sort((a, b) => (a.month < b.month ? 1 : -1));
  const grandIncome = summaries.reduce((sum, s) => sum + s.incomeCents, 0);
  const grandExpense = summaries.reduce((sum, s) => sum + s.expenseCents, 0);

  function downloadMonthly() {
    const rows: string[][] = [
      ["Month", "Income (KES)", "Expenses (KES)", "Net (KES)"],
      ...sorted.map((s) => [
        formatMonth(s.month),
        String(s.incomeCents / 100),
        String(s.expenseCents / 100),
        String((s.incomeCents - s.expenseCents) / 100),
      ]),
      ["TOTAL", String(grandIncome / 100), String(grandExpense / 100), String((grandIncome - grandExpense) / 100)],
    ];
    downloadCsv(`ctc-financial-monthly-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }

  function downloadDetailed() {
    const rows: string[][] = [
      ["Date", "Type", "Name", "Category", "Description", "Amount (KES)", "Recorded by"],
      ...[...lines]
        .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1))
        .map((l) => [
          new Date(l.occurredAt).toLocaleDateString("en-KE"),
          l.type,
          l.partyName ?? "",
          l.category,
          l.description,
          String(l.amountCents / 100),
          l.recordedByName,
        ]),
    ];
    downloadCsv(`ctc-financial-detailed-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">Download monthly totals or the full transaction ledger as CSV.</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={sorted.length === 0}
            onClick={downloadMonthly}
            className="inline-flex items-center gap-1.5"
          >
            <Download size={14} /> Download monthly CSV
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={lines.length === 0}
            onClick={downloadDetailed}
            className="inline-flex items-center gap-1.5"
          >
            <Download size={14} /> Download detailed CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">All-Time Income</div>
          <div className="mt-2 font-display text-2xl font-bold text-green">{formatMoney(grandIncome)}</div>
        </div>
        <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">All-Time Expenses</div>
          <div className="mt-2 font-display text-2xl font-bold text-red-600">{formatMoney(grandExpense)}</div>
        </div>
        <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Net</div>
          <div className="mt-2 font-display text-2xl font-bold text-ink">
            {formatMoney(grandIncome - grandExpense)}
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-card-sm)] border border-line bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-green" />
          <h3 className="font-display text-sm font-bold text-ink">Monthly Breakdown</h3>
        </div>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted">No transactions recorded yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="py-2">Month</th>
                <th className="py-2 text-right">Income</th>
                <th className="py-2 text-right">Expenses</th>
                <th className="py-2 text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
                <tr key={s.month} className="border-b border-line last:border-0">
                  <td className="py-2.5 font-medium text-ink">{formatMonth(s.month)}</td>
                  <td className="py-2.5 text-right text-green">{formatMoney(s.incomeCents)}</td>
                  <td className="py-2.5 text-right text-red-600">{formatMoney(s.expenseCents)}</td>
                  <td className="py-2.5 text-right font-semibold text-ink">
                    {formatMoney(s.incomeCents - s.expenseCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
