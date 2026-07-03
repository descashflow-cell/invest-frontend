import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonth, shiftMonth, monthKey } from "@/lib/format";

export default function MonthSwitcher({ month, onChange }) {
  const isCurrent = month === monthKey(new Date());

  return (
    <div className="flex items-center gap-2" data-testid="month-switcher">
      <button
        type="button"
        onClick={() => onChange(shiftMonth(month, -1))}
        className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-white/10 hover:bg-white/5 transition-colors active:scale-95"
        data-testid="month-prev"
        aria-label="Mese precedente"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="px-5 h-10 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.02] min-w-[180px]" data-testid="month-label">
        <span className="text-sm font-medium tracking-tight">{formatMonth(month)}</span>
        {isCurrent && (
          <span className="ml-2 text-[9px] uppercase tracking-[0.2em] text-emerald-400/80 font-bold">Live</span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(shiftMonth(month, 1))}
        className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-white/10 hover:bg-white/5 transition-colors active:scale-95"
        data-testid="month-next"
        aria-label="Mese successivo"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
