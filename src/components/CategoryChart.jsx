import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatEUR } from "@/lib/format";

const COLORS = ["#FFFFFF", "#D4D4D4", "#A3A3A3", "#737373", "#525252", "#404040", "#262626"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs">
      <div className="uppercase tracking-[0.18em] text-neutral-500 mb-1">{p.category}</div>
      <div className="font-mono-num text-white">{formatEUR(p.total)}</div>
    </div>
  );
};

export default function CategoryChart({ byCategory, total }) {
  const hasData = byCategory.length > 0 && total > 0;

  return (
    <div
      data-testid="category-chart"
      className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 h-full flex flex-col min-h-[340px]"
    >
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-2">
          Analysis · by Category
        </p>
        <div className="font-mono-num text-3xl sm:text-4xl tracking-tight">
          {formatEUR(total)}
        </div>
        <p className="text-xs text-neutral-500 mt-1">Extra Expenses Distribution</p>
      </div>

      {!hasData ? (
        <div className="mt-6 flex-1 flex items-center justify-center text-sm text-neutral-600 border border-dashed border-white/10 rounded-xl">
          Add expenses to see the analysis
        </div>
      ) : (
        <div className="mt-4 flex-1 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-[55%] h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="total"
                  nameKey="category"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  stroke="#0A0A0A"
                  strokeWidth={2}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="w-full sm:w-[45%] space-y-2 max-h-[200px] overflow-y-auto" data-testid="category-legend">
            {byCategory.map((c, i) => {
              const pct = total > 0 ? (c.total / total) * 100 : 0;
              return (
                <li key={c.category} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="truncate">{c.category}</span>
                  </div>
                  <span className="font-mono-num text-neutral-400 flex-shrink-0">{pct.toFixed(0)}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
