import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend, Brush,
} from "recharts";
import { ChevronLeft, ChevronRight, Trophy, TrendingDown, ChevronDown } from "lucide-react";
import { getYtd } from "@/lib/api";
import { formatEUR } from "@/lib/format";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const YEARLY_TYPE = {name: "yearly", label: "Yearly"};
// const DECENNIAL_TYPE = {name: "decennial", label: "Decennial"};
const ALLTIME_TYPE = {name: "alltime", label: "All Time"};

const fmtAxis = (v) => {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return `${v}`;
};

const Tip = ({ active, payload, label, invIncl }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-xs space-y-1 min-w-[180px]">
      <div className="uppercase tracking-[0.18em] text-neutral-500 mb-1.5 font-bold">{label}</div>
      <div className="flex justify-between gap-4"><span className="text-emerald-400">Incomes</span><span className="font-mono-num">{formatEUR(d.income)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-red-400">Expenses</span><span className="font-mono-num">{formatEUR(d.expenses)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-sky-400">Invested</span><span className="font-mono-num">{formatEUR(d.invested)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-yellow-400">Net Revenue</span><span className="font-mono-num">{formatEUR(invIncl ? d.saved : d.balance)}</span></div>
    </div>
  );
};

function Kpi({ label, value, accent, testid, hasCheck, checked, setChecked }) {
  if(hasCheck) {
    return (
      <div className="border border-white/10 rounded-xl p-4 sm:p-5 bg-white/[0.02] flex gap-4" data-testid={testid}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 mb-2">{label}</p>
          <div className={`font-mono-num text-xl sm:text-2xl tracking-tight ${accent || "text-white"}`}>{value}</div>
        </div>
        <div className="flex items-center mb-4 gap-2">
          <input id="default-checkbox" type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium" />
          <label htmlFor="default-checkbox" className="select-none ms-2 text-sm font-medium text-heading">Investment included</label>
        </div>
      </div>
    );
  }
  return (
    <div className="border border-white/10 rounded-xl p-4 sm:p-5 bg-white/[0.02]" data-testid={testid}>
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 mb-2">{label}</p>
      <div className={`font-mono-num text-xl sm:text-2xl tracking-tight ${accent || "text-white"}`}>{value}</div>
    </div>
  );
}

export default function YtdCard() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [decade, setDecade] = useState(() => Math.floor(new Date().getFullYear() / 10) * 10);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invIncl, setInvIncl] = useState(true);
  const [filterType, setFilterType] = useState(YEARLY_TYPE);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getYtd(filterType.name, year)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filterType, year]);

  const chartData = (data?.series ?? []).map((s, i) => ({
    label: filterType?.name === YEARLY_TYPE.name ? MONTHS_SHORT[i] : s.month,
    income: s.income,
    expenses: s.expenses,
    invested: s.invested,
    saved: s.saved,
    balance: s.balance,
  }));

  const t = data?.totals ?? { income: 0, expenses: 0, invested: 0, saved: 0, active_months: 0, avg_saved: 0 };
  const best = data?.best_month;
  const worst = data?.worst_month;

  const monthLabel = (key) => {
    if (!key) return "—";
    const [, m] = key.split("-");
    return MONTHS_FULL[Number(m) - 1];
  };

  const handleBrushChange = (range) => {
    console.log(range);
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
              Year <span className="font-mono-num text-neutral-400">{year}</span>
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5">
            {t.active_months} {t.active_months === 1 ? "active month" : "active months"} · average monthly invested {formatEUR(t.active_months ? t.invested / t.active_months : 0)}
          </p>
        </div>
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] text-white inline-flex items-center justify-center gap-1">
                {filterType?.label ?? "Select Type"}
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {[YEARLY_TYPE, ALLTIME_TYPE].map((type) => (
                <DropdownMenuItem key={type.name} onSelect={() => {
                  setFilterType(type);
                  if(type.name === ALLTIME_TYPE.name) {
                    setYear(new Date().getFullYear());
                  }
                }}>
                  {type.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2" data-testid="year-switcher">
            {filterType?.name !== ALLTIME_TYPE.name && 
              <button
                type="button"
                onClick={() => setYear((y) => y - 1)}
                className="w-9 h-9 font-mono-num text-sm inline-flex items-center justify-center rounded-full border border-white/10 hover:bg-white/5 transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="year-prev"
                aria-label="Previous year"
                disabled={year <= 2000}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            }
            <div className="px-4 h-9 inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] font-mono-num text-sm" data-testid="year-label">
              {filterType?.name === YEARLY_TYPE.name ? year : `Up to ${new Date().getFullYear()}`}
            </div>
            {filterType?.name !== ALLTIME_TYPE.name && 
              <button
                type="button"
                onClick={() => setYear((y) => y + 1)}
                className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-white/10 hover:bg-white/5 transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="year-next"
                aria-label="Next year"
                disabled={year >= 2100}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            }
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        <Kpi label="Income" value={formatEUR(t.income)} accent="text-emerald-400" testid="ytd-kpi-income" hasCheck={false}/>
        <Kpi label="Expenses" value={formatEUR(t.expenses)} accent="text-red-400" testid="ytd-kpi-expenses" hasCheck={false} />
        <Kpi label="Invested" value={formatEUR(t.invested)} accent="text-sky-400" testid="ytd-kpi-invested" hasCheck={true} checked={invIncl} setChecked={setInvIncl} />
        <Kpi label="Net Revenue" value={formatEUR(invIncl ? t.saved : t.balance)} accent="text-yellow-400" testid="ytd-kpi-net-revenue" hasCheck={false} />
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
              <Tooltip content={<Tip invIncl={invIncl} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Legend
                wrapperStyle={{ paddingTop: 8, fontSize: 11 }}
                iconType="circle"
                formatter={(v) => <span className="text-neutral-400">{v}</span>}
              />
              <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} barSize={17} />
              <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={17} />
              <Bar dataKey="invested" name="Invested" fill="#38BDF8" radius={[4, 4, 0, 0]} barSize={17} />
              <Bar dataKey={invIncl ? "saved" : "balance"} name="Net Revenue" fill="#FACC15" radius={[4, 4, 0, 0]} barSize={17} />
              {filterType?.name === ALLTIME_TYPE.name && chartData.length > 10 && (
                <Brush
                dataKey="label"
                height={30}
                startIndex={chartData.length - 10}
                endIndex={chartData.length - 1}
                onDragEnd={handleBrushChange}
              />)}
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
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Best {filterType?.name == ALLTIME_TYPE.name ? "year" : "month"} · balance</p>
                <p className="text-sm mt-0.5">{filterType?.name == ALLTIME_TYPE.name ? best?.month : monthLabel(best?.month)}</p>
              </div>
            </div>
            <span className="font-mono-num text-emerald-400">{formatEUR(invIncl ? best?.saved ?? 0 : best?.balance ?? 0)}</span>
          </div>
          <div className="border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4" data-testid="ytd-worst">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Worst {filterType?.name == ALLTIME_TYPE.name ? "year" : "month"} · balance</p>
                <p className="text-sm mt-0.5">{filterType?.name == ALLTIME_TYPE.name ? worst?.month : monthLabel(worst?.month)}</p>
              </div>
            </div>
            <span className={`font-mono-num ${(worst?.saved ?? 0) < 0 ? "text-red-400" : "text-neutral-300"}`}>{formatEUR(invIncl ? worst?.saved ?? 0 : worst?.balance ?? 0)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
