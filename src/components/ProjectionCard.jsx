import { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine,
} from "recharts";
import { Sparkles, RotateCcw, ChevronDown } from "lucide-react";
import { getPortfolio, getYtd } from "@/lib/api";
import { formatEUR } from "@/lib/format";

const fmtAxis = (v) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return `${v}`;
};

/**
 * Compound projection with monthly contributions, monthly management fee,
 * annual performance fee on positive yearly gains, and final capital-gains tax.
 * Returns { series, gross, net, contributed, fees, tax }.
 */
function project({ initial, monthly, annualRate, years, mgmtPct, perfPct, taxPct }) {
  const r = (annualRate / 100) / 12;
  const mgmtMonthly = (mgmtPct / 100) / 12;
  const perf = (perfPct || 0) / 100;
  const tax = (taxPct || 0) / 100;

  let value = Number(initial) || 0;
  let contributed = value;
  let totalFees = 0;
  let yearStartValue = value;

  const series = [{ year: 0, gross: value, net: value, contributed }];

  const Y = Math.max(0, Math.round(years));
  for (let m = 1; m <= Y * 12; m++) {
    // gross monthly growth
    value = value * (1 + r) + monthly;
    contributed += monthly;
    // management fee monthly on AUM
    const mgmtFee = value * mgmtMonthly;
    value -= mgmtFee;
    totalFees += mgmtFee;

    if (m % 12 === 0) {
      // performance fee on yearly positive gain (net of mgmt)
      const yearGain = value - yearStartValue - monthly * 12;
      if (perf > 0 && yearGain > 0) {
        const perfFee = yearGain * perf;
        value -= perfFee;
        totalFees += perfFee;
      }
      yearStartValue = value;

      // unrealised — show net = gross-but-pretax minus simulated end-of-period tax
      const gain = Math.max(0, value - contributed);
      const taxNow = gain * tax;
      series.push({
        year: m / 12,
        gross: Math.round(value),
        net: Math.round(value - taxNow),
        contributed: Math.round(contributed),
      });
    }
  }

  const gross = value;
  const gain = Math.max(0, gross - contributed);
  const taxAmount = gain * tax;
  const net = gross - taxAmount;

  return {
    series,
    gross,
    net,
    contributed,
    fees: totalFees,
    tax: taxAmount,
    interest: gross - contributed,
  };
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-xs space-y-1 min-w-[220px]">
      <div className="uppercase tracking-[0.18em] text-neutral-500 mb-1.5 font-bold">Year {label}</div>
      <div className="flex justify-between gap-4"><span className="text-sky-400">Gross</span><span className="font-mono-num">{formatEUR(d.gross)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-emerald-400">Net post-tax</span><span className="font-mono-num">{formatEUR(d.net)}</span></div>
      <div className="flex justify-between gap-4"><span className="text-neutral-400">Contributed</span><span className="font-mono-num">{formatEUR(d.contributed)}</span></div>
    </div>
  );
};

const HORIZONS = [10, 15, 20];

export default function ProjectionCard() {
  const [initial, setInitial] = useState(0);
  const [monthly, setMonthly] = useState(300);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(15);
  const [touched, setTouched] = useState(false);

  // costs & tax
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [taxPct, setTaxPct] = useState(26); // IT default
  const [mgmtPct, setMgmtPct] = useState(0); // % annuo
  const [perfPct, setPerfPct] = useState(0); // % sul guadagno annuo

  useEffect(() => {
    if (touched) return;
    const year = new Date().getFullYear();
    Promise.all([getPortfolio().catch(() => null), getYtd(year).catch(() => null)])
      .then(([p, y]) => {
        if (p?.total != null) setInitial(Math.round(p.total));
        const am = y?.totals?.active_months || 0;
        const inv = y?.totals?.invested || 0;
        if (am > 0) setMonthly(Math.round(inv / am));
      });
  }, [touched]);

  const result = useMemo(
    () => project({
      initial: Number(initial) || 0,
      monthly: Number(monthly) || 0,
      annualRate: Number(rate) || 0,
      years: Number(years) || 0,
      mgmtPct: Number(mgmtPct) || 0,
      perfPct: Number(perfPct) || 0,
      taxPct: Number(taxPct) || 0,
    }),
    [initial, monthly, rate, years, mgmtPct, perfPct, taxPct]
  );

  const reset = () => {
    setTouched(false);
    setRate(7); setYears(15);
    setTaxPct(0); setMgmtPct(0); setPerfPct(0);
    setShowAdvanced(false);
  };

  return (
    <div data-testid="projection-card" className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-2 inline-flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> Compound Interest Calculator
          </p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <div className="font-mono-num text-4xl sm:text-5xl tracking-tight text-emerald-400" data-testid="projection-net">
              {formatEUR(result.net)}
            </div>
            <div className="text-xs text-neutral-500">
              net · over <span className="font-mono-num text-neutral-300">{years} years</span> at <span className="font-mono-num text-neutral-300">{rate}%</span>/year
            </div>
          </div>
          <div className="mt-1.5 text-xs text-neutral-500 flex flex-wrap gap-x-3 gap-y-1">
            <span>Gross <span className="font-mono-num text-neutral-300" data-testid="projection-gross">{formatEUR(result.gross)}</span></span>
            <span>· Contributed <span className="font-mono-num text-neutral-300">{formatEUR(result.contributed)}</span></span>
            <span>· Tax <span className="font-mono-num text-red-400" data-testid="projection-tax">{formatEUR(result.tax)}</span></span>
            {(mgmtPct > 0 || perfPct > 0) && (
              <span>· Fees <span className="font-mono-num text-amber-400" data-testid="projection-fees">{formatEUR(result.fees)}</span></span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors active:scale-95 text-xs inline-flex items-center gap-1.5 text-neutral-400 flex-shrink-0"
          data-testid="projection-reset"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Inputs base */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Initial Capital</span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-mono-num text-neutral-500">€</span>
              <input
                type="number" min="0" step="100" value={initial}
                onChange={(e) => { setTouched(true); setInitial(e.target.value); }}
                className="bg-transparent border-0 border-b border-white/20 focus:border-white outline-none font-mono-num text-2xl py-1 w-full placeholder:text-white/10"
                data-testid="projection-initial-input"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Monthly Contribution</span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-mono-num text-neutral-500">€</span>
              <input
                type="number" min="0" step="50" value={monthly}
                onChange={(e) => { setTouched(true); setMonthly(e.target.value); }}
                className="bg-transparent border-0 border-b border-white/20 focus:border-white outline-none font-mono-num text-2xl py-1 w-full placeholder:text-white/10"
                data-testid="projection-monthly-input"
              />
            </div>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Annual Yield</span>
              <span className="font-mono-num text-sky-400 text-sm">{Number(rate).toFixed(1)}%</span>
            </div>
            <input
              type="range" min="1" max="15" step="0.5" value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="mt-2 w-full accent-sky-400"
              data-testid="projection-rate-input"
            />
            <div className="flex justify-between text-[10px] text-neutral-600 font-mono-num mt-1">
              <span>1%</span><span>7% average</span><span>15%</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Time Horizon</span>
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              {HORIZONS.map((h) => (
                <button
                  key={h} type="button" onClick={() => setYears(h)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                    Number(years) === h
                      ? "bg-white text-black border-white"
                      : "border-white/10 text-neutral-300 hover:bg-white/5"
                  }`}
                  data-testid={`projection-years-${h}`}
                >
                  {h} years
                </button>
              ))}
              <div className="flex items-center gap-1.5 border border-white/10 rounded-full px-3 py-1">
                <input
                  type="number" min="1" max="60" value={years}
                  onChange={(e) => setYears(Number(e.target.value) || 0)}
                  className="bg-transparent w-12 text-sm text-center font-mono-num outline-none"
                  data-testid="projection-years-custom"
                />
                <span className="text-xs text-neutral-500">years</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced section */}
      <div className="mt-6 border-t border-white/5 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="w-full flex items-center justify-between text-left group"
          data-testid="projection-advanced-toggle"
        >
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500 group-hover:text-neutral-300 transition-colors inline-flex items-center gap-2">
            Advanced Options
            <span className="text-neutral-700 normal-case tracking-tight">· taxes, management &amp; performance fee</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-all ${showAdvanced ? "rotate-180" : ""}`} />
        </button>

        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="projection-advanced-panel">
            <label className="block border border-white/10 rounded-xl p-4">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Capital Gains Tax</span>
                <span className="font-mono-num text-red-400 text-sm">{taxPct}%</span>
              </div>
              <input
                type="range" min="0" max="43" step="0.5" value={taxPct}
                onChange={(e) => setTaxPct(Number(e.target.value))}
                className="w-full accent-red-400"
                data-testid="projection-tax-input"
              />
              <p className="mt-2 text-[10px] text-neutral-600 leading-relaxed">
                Italy: 26% standard · 12.5% on government bonds
              </p>
            </label>

            <label className="block border border-white/10 rounded-xl p-4">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Management fee / year</span>
                <span className="font-mono-num text-amber-400 text-sm">{Number(mgmtPct).toFixed(2)}%</span>
              </div>
              <input
                type="range" min="0" max="3" step="0.05" value={mgmtPct}
                onChange={(e) => setMgmtPct(Number(e.target.value))}
                className="w-full accent-amber-400"
                data-testid="projection-mgmt-input"
              />
              <p className="mt-2 text-[10px] text-neutral-600 leading-relaxed">
                Typical ETF TER 0.07–0.40% · active funds 1–2%
              </p>
            </label>

            <label className="block border border-white/10 rounded-xl p-4">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">Performance fee</span>
                <span className="font-mono-num text-amber-400 text-sm">{Number(perfPct).toFixed(1)}%</span>
              </div>
              <input
                type="range" min="0" max="30" step="0.5" value={perfPct}
                onChange={(e) => setPerfPct(Number(e.target.value))}
                className="w-full accent-amber-400"
                data-testid="projection-perf-input"
              />
              <p className="mt-2 text-[10px] text-neutral-600 leading-relaxed">
                On positive annual gain (if expected)
              </p>
            </label>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="mt-7 h-[260px] sm:h-[300px]" data-testid="projection-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={result.series} margin={{ top: 12, right: 12, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="year" stroke="#525252"
              tick={{ fontSize: 11, fill: "#737373" }}
              tickLine={false} axisLine={false}
              tickFormatter={(v) => `${v}y`}
            />
            <YAxis
              stroke="#525252"
              tick={{ fontSize: 10, fill: "#737373" }}
              tickFormatter={fmtAxis}
              tickLine={false} axisLine={false} width={56}
            />
            <Tooltip content={<Tip />} cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }} />
            <ReferenceLine y={result.contributed} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" label={{ value: "versato", position: "right", fill: "#737373", fontSize: 10 }} />
            <Line type="monotone" dataKey="contributed" stroke="#737373" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Versato" />
            <Line type="monotone" dataKey="gross" stroke="#38BDF8" strokeWidth={2.5} dot={false} name="Lordo" />
            <Line type="monotone" dataKey="net" stroke="#10B981" strokeWidth={2.5} dot={false} name="Netto" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-[11px] text-neutral-600 leading-relaxed">
        Theoretical simulation with monthly compound interest. Management fee deducted monthly on AUM, performance fee at the end of the year on positive gain, capital gains tax calculated on any gain (excluding contributions) upon withdrawal.
      </p>
    </div>
  );
}
