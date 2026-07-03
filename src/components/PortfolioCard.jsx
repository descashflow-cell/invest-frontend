import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getPortfolio } from "@/lib/api";
import { formatEUR } from "@/lib/format";

const COLORS = ["#38BDF8", "#A78BFA", "#F472B6", "#FBBF24", "#34D399", "#F87171", "#94A3B8", "#FB923C"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs">
      <div className="uppercase tracking-[0.18em] text-neutral-500 mb-1">{p.name}</div>
      <div className="font-mono-num text-white">{formatEUR(p.total)}</div>
    </div>
  );
};

export default function PortfolioCard({ refreshKey }) {
  const [data, setData] = useState({ total: 0, items: []/*, starting_investments: []*/ });
  const [loading, setLoading] = useState(true);
  // const [deletingIds, setDeletingIds] = useState(() => new Set());
  // const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPortfolio()
      .then((res) => { if (!cancelled) setData(res); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  // const remove = async (id) => {
  //   if (deletingIds.has(id)) return;
  //   setDeletingIds((s) => new Set(s).add(id));
  //   try {
  //     await deleteInvestment(id);
  //     toast.success("Investment removed");
  //     setRefresh((r) => r + 1);
  //   } catch (e) {
  //     if (e?.response?.status === 404) {
  //       setRefresh((r) => r + 1);
  //     } else {
  //       toast.error("Error deleting investment");
  //       setDeletingIds((s) => {
  //         const next = new Set(s);
  //         next.delete(id);
  //         return next;
  //       });
  //     }
  //   }
  // };

  const items = data.items || [];
  const total = data.total || 0;
  // const startingInvestments = data.starting_investments || [];
  const hasData = items.length > 0 && total > 0;

  return (
    <div
      data-testid="portfolio-card"
      className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 h-full flex flex-col min-h-[340px]"
    >
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-2">
          Portfolio · Cumulative
        </p>
        <div className="font-mono-num text-3xl sm:text-4xl tracking-tight text-sky-400" data-testid="portfolio-total">
          {formatEUR(total)}
        </div>
        <p className="text-xs text-neutral-500 mt-1">Total allocation by sector / ETF</p>
      </div>

      {!hasData ? (
        <div className="mt-6 flex-1 flex items-center justify-center text-sm text-neutral-600 border border-dashed border-white/10 rounded-xl">
          {loading ? "—" : "Add investments to see the allocation"}
        </div>
      ) : (
        <>
          <div className="mt-4 flex-1 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-[55%] h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={items}
                    dataKey="total"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                    stroke="#0A0A0A"
                    strokeWidth={2}
                  >
                    {items.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="w-full sm:w-[45%] space-y-2 max-h-[200px] overflow-y-auto" data-testid="portfolio-legend">
              {items.map((c, i) => {
                const pct = total > 0 ? (c.total / total) * 100 : 0;
                return (
                  <li key={c.name} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="truncate">{c.name}</span>
                    </div>
                    <span className="font-mono-num text-neutral-400 flex-shrink-0">{pct.toFixed(0)}%</span>
                  </li>
                );
              })}
            </ul>
          </div>
          {/* <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-2">Starting Investments</p>
            {startingInvestments.length > 0 && (
              <ul className="divide-y divide-white/5">
                {startingInvestments.map((it) => (
                  <li key={it.id} className="py-3 flex items-center justify-between group gap-3" data-testid={`investment-item-${it.id}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                      <span className="text-sm truncate">{it.name}</span>
                    </div>
                    <div className="flex items-center gap-3 min-w-0 flex-1 justify-center">
                      <span className="text-sm truncate">{capitalize(it.type) || 'Recurring'}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-mono-num text-sm text-neutral-300">{formatEUR(it.amount)}</span>
                      <button
                        type="button"
                        onClick={() => remove(it.id)}
                        disabled={deletingIds.has(it.id)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        data-testid={`investment-delete-${it.id}`}
                        aria-label="Elimina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div> */}
        </>
      )}
    </div>
  );
}
