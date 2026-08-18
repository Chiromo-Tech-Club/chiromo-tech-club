import { BarChart3 } from "lucide-react";

export interface MonthlySummary {
  month: string; // "2026-01"
  incomeCents: number;
  expenseCents: number;
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "KES", maximumFractionDigits: 0 });
}

function formatMonth(month: string) {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function FinancialReports({ summaries }: { summaries: MonthlySummary[] }) {
  const sorted = [...summaries].sort((a, b) => (a.month < b.month ? 1 : -1));
  const grandIncome = summaries.reduce((sum, s) => sum + s.incomeCents, 0);
  const grandExpense = summaries.reduce((sum, s) => sum + s.expenseCents, 0);

  return (
    <div className="flex flex-col gap-6">
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
          <div className="mt-2 font-display text-2xl font-bold text-ink">{formatMoney(grandIncome - grandExpense)}</div>
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
                  <td className="py-2.5 text-right font-semibold text-ink">{formatMoney(s.incomeCents - s.expenseCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
