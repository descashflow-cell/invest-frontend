import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { ChevronLeft, ChevronRight, Trophy, TrendingDown } from "lucide-react";
import { getYtd } from "@/lib/api";
import { formatEUR } from "@/lib/format";

const MONTHS_SHORT = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
const MONTHS_FULL = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

const fmtAxis = (v) => {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return `${v}`;
};

const Tip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-xs space-y-1 min-w-[180px]">
      <div className="uppercase tracking-[0.18em] text-neutral-500 mb-1.5 font-bold">{label}</div>
      <div className="flex justify-between gap-4"><span className="text-emerald-400">Entrate</span><span className="font-mono-num">{formatEUR(d.income)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-red-400">Uscite</span><span className="font-mono-num">{formatEUR(d.expenses)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-sky-400">Investito</span><span className="font-mono-num">{formatEUR(d.invested)}</span></div>
    </div>
  );
};

function Kpi({ label, value, accent, testid }) {
  return (
    <div className="border border-white/10 rounded-xl p-4 sm:p-5 bg-white/[0.02]" data-testid={testid}>
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 mb-2">{label}</p>
      <div className={`font-mono-num text-xl sm:text-2xl tracking-tight ${accent || "text-white"}`}>{value}</div>
    </div>
  );
}

export default function YtdCard() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getYtd(year)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [year]);

  const chartData = (data?.series ?? []).map((s, i) => ({
    label: MONTHS_SHORT[i],
    income: s.income,
    expenses: s.expenses,
    invested: s.invested,
  }));

  const t = data?.totals ?? { income: 0, expenses: 0, invested: 0, saved: 0, active_months: 0, avg_saved: 0 };
  const best = data?.best_month;
  const worst = data?.worst_month;

  const monthLabel = (key) => {
    if (!key) return "—";
    const [, m] = key.split("-");
    return MONTHS_FULL[Number(m) - 1];
  };

  return (
    <div data-testid="ytd-card" className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-2">
            Dashboard · YTD
          </p>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display text-3xl sm:text-4xl tracking-tighter font-light leading-none">
              Anno <span className="font-mono-num text-neutral-400">{year}</span>
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5">
            {t.active_months} {t.active_months === 1 ? "mese attivo" : "mesi attivi"} · media mensile investita {formatEUR(t.active_months ? t.invested / t.active_months : 0)}
          </p>
        </div>
        <div className="flex items-center gap-2" data-testid="year-switcher">
          <button
            type="button"
            onClick={() => setYear((y) => y - 1)}
            className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-white/10 hover:bg-white/5 transition-colors active:scale-95"
            data-testid="year-prev"
            aria-label="Anno precedente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-4 h-9 inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] font-mono-num text-sm" data-testid="year-label">
            {year}
          </div>
          <button
            type="button"
            onClick={() => setYear((y) => y + 1)}
            className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-white/10 hover:bg-white/5 transition-colors active:scale-95"
            data-testid="year-next"
            aria-label="Anno successivo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Kpi label="Entrate" value={formatEUR(t.income)} accent="text-emerald-400" testid="ytd-kpi-income" />
        <Kpi label="Uscite" value={formatEUR(t.expenses)} accent="text-red-400" testid="ytd-kpi-expenses" />
        <Kpi label="Investito" value={formatEUR(t.invested)} accent="text-sky-400" testid="ytd-kpi-invested" />
      </div>

      {/* Chart */}
      <div className="mt-6 h-[280px] sm:h-[320px]" data-testid="ytd-chart">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-neutral-600">—</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 12, right: 0, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" stroke="#525252" tick={{ fontSize: 11, fill: "#737373" }} tickLine={false} axisLine={false} />
              <YAxis stroke="#525252" tick={{ fontSize: 10, fill: "#737373" }} tickFormatter={fmtAxis} tickLine={false} axisLine={false} width={48} />
              <Tooltip content={<Tip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Legend
                wrapperStyle={{ paddingTop: 8, fontSize: 11 }}
                iconType="circle"
                formatter={(v) => <span className="text-neutral-400">{v}</span>}
              />
              <Bar dataKey="income" name="Entrate" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expenses" name="Uscite" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="invested" name="Investito" fill="#38BDF8" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="saved" name="Risparmiato" fill="#FFFFFF" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Best / Worst */}
      {(best || worst) && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4" data-testid="ytd-best">
            <div className="flex items-center gap-3">
              <Trophy className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Mese top · saldo</p>
                <p className="text-sm mt-0.5">{monthLabel(best?.month)}</p>
              </div>
            </div>
            <span className="font-mono-num text-emerald-400">{formatEUR((best?.saved ?? 0) + (data?.series?.find(s => s.month === best?.month)?.invested ?? 0))}</span>
          </div>
          <div className="border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4" data-testid="ytd-worst">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Mese peggiore · saldo</p>
                <p className="text-sm mt-0.5">{monthLabel(worst?.month)}</p>
              </div>
            </div>
            <span className={`font-mono-num ${((worst?.saved ?? 0) + (data?.series?.find(s => s.month === worst?.month)?.invested ?? 0)) < 0 ? "text-red-400" : "text-neutral-300"}`}>{formatEUR((worst?.saved ?? 0) + (data?.series?.find(s => s.month === worst?.month)?.invested ?? 0))}</span>
          </div>
        </div>
      )}
    </div>
  );
}
