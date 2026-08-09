import { PieChart } from "lucide-react";

export interface MonthlyBar {
  month: string;
  incomeCents: number;
  expenseCents: number;
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "KES", maximumFractionDigits: 0 });
}

function formatMonth(month: string) {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString(undefined, { month: "short" });
}

export function FinancialCharts({ bars }: { bars: MonthlyBar[] }) {
  const sorted = [...bars].sort((a, b) => (a.month < b.month ? -1 : 1));
  const maxValue = Math.max(1, ...sorted.flatMap((b) => [b.incomeCents, b.expenseCents]));

  return (
    <div className="rounded-[var(--radius-card-sm)] border border-line bg-white p-6">
      <div className="mb-1 flex items-center gap-2">
        <PieChart size={16} className="text-green" />
        <h3 className="font-display text-sm font-bold text-ink">Income vs. Expenses</h3>
      </div>
      <div className="mb-4 flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green" /> Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" /> Expenses
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted">No transactions recorded yet.</p>
      ) : (
        <div className="flex items-end gap-4 overflow-x-auto pb-2">
          {sorted.map((b) => (
            <div key={b.month} className="flex flex-none flex-col items-center gap-1">
              <div className="flex h-40 items-end gap-1">
                <div
                  title={formatMoney(b.incomeCents)}
                  className="w-4 rounded-t bg-green"
                  style={{ height: `${(b.incomeCents / maxValue) * 100}%` }}
                />
                <div
                  title={formatMoney(b.expenseCents)}
                  className="w-4 rounded-t bg-red-400"
                  style={{ height: `${(b.expenseCents / maxValue) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-muted">{formatMonth(b.month)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
