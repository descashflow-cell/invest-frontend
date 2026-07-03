import { formatEUR } from "@/lib/format";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function BalanceCard({ data, loading }) {
  const balance = data?.balance ?? 0;
  const salary = data?.incomes?.reduce((s, i) => s + i.amount, 0) ?? 0;
  const positive = balance >= 0;

  const pct = salary > 0 ? Math.max(0, Math.min(100, (balance / salary) * 100)) : 0;

  return (
    <div
      data-testid="balance-card"
      className="relative overflow-hidden bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 h-full flex flex-col justify-between min-h-[260px]"
    >
      {/* abstract decoration */}
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full border border-white/[0.03] pointer-events-none" />

      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500">
          Monthly balance
        </p>
        <div className={`inline-flex items-center gap-1.5 text-xs ${positive ? "text-emerald-400" : "text-red-400"}`} data-testid="balance-trend">
          {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span className="font-mono-num">{positive ? "+" : ""}{salary > 0 ? `${((balance / salary) * 100).toFixed(1)}%` : "—"}</span>
        </div>
      </div>

      <div className="mt-6">
        <div
          className={`font-mono-num text-5xl sm:text-6xl tracking-tight leading-none ${positive ? "text-white" : "text-red-400"}`}
          data-testid="balance-amount"
        >
          {loading ? "—" : formatEUR(balance)}
        </div>
        <p className="mt-3 text-sm text-neutral-500">
          {positive ? "Remaining Balance" : "Over Budget This Month"}
        </p>
      </div>

      <div className="mt-6">
        <div className="h-[2px] w-full bg-white/5 overflow-hidden rounded-full">
          <div
            className={`h-full ${positive ? "bg-emerald-400" : "bg-red-400"} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 font-mono-num">
          <span>Income {formatEUR(salary)}</span>
          <span>Expenses {formatEUR((data?.fixed_total ?? 0) + (data?.extra_total ?? 0))}</span>
          <span>Investments {formatEUR(data?.investments_month_total ?? 0)}</span>
        </div>
      </div>
    </div>
  );
}
