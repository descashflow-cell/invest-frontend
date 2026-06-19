import { useState } from "react";
import { Plus, Trash2, X, TrendingUp } from "lucide-react";
import { addInvestment, deleteInvestment } from "@/lib/api";
import { formatEUR } from "@/lib/format";
import { toast } from "sonner";

export default function InvestmentsCard({ month, items, suggested, totalMonth, onChanged }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingIds, setDeletingIds] = useState(() => new Set());

  const reset = () => { setName(""); setAmount(""); setAdding(false); };

  const usedPct = suggested > 0 ? Math.min(100, (totalMonth / suggested) * 100) : 0;
  const overBudget = totalMonth > suggested && suggested > 0;

  const save = async () => {
    const num = parseFloat(amount);
    if (!name.trim() || isNaN(num) || num <= 0) {
      toast.error("Compila settore/ETF e importo");
      return;
    }
    setSaving(true);
    try {
      await addInvestment({ name: name.trim(), amount: num, month });
      toast.success("Investimento aggiunto");
      reset();
      onChanged?.();
    } catch {
      toast.error("Errore nell'aggiunta");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (deletingIds.has(id)) return;
    setDeletingIds((s) => new Set(s).add(id));
    try {
      await deleteInvestment(id);
      toast.success("Investimento rimosso");
      onChanged?.();
    } catch (e) {
      if (e?.response?.status === 404) {
        onChanged?.();
      } else {
        toast.error("Errore nell'eliminazione");
        setDeletingIds((s) => {
          const next = new Set(s);
          next.delete(id);
          return next;
        });
      }
    }
  };

  return (
    <div
      data-testid="investments-card"
      className="relative overflow-hidden bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 h-full flex flex-col"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-2">
            Investimenti · del mese
          </p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <div className="font-mono-num text-3xl sm:text-4xl tracking-tight text-sky-400" data-testid="investments-total">
              {formatEUR(totalMonth)}
            </div>
            <div className="text-xs text-neutral-500">
              su <span className="font-mono-num text-neutral-300" data-testid="suggested-investable">{formatEUR(suggested)}</span> suggeriti
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1.5 inline-flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" /> 50% del saldo come quota investibile
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="bg-sky-400 text-black font-medium px-5 py-2.5 rounded-full hover:bg-sky-300 transition-colors active:scale-95 inline-flex items-center gap-1.5 text-sm flex-shrink-0"
            data-testid="add-investment-button"
          >
            <Plus className="w-4 h-4" /> Investi
          </button>
        )}
      </div>

      {/* progress bar */}
      <div className="mt-4">
        <div className="h-[2px] w-full bg-white/5 overflow-hidden rounded-full">
          <div
            className={`h-full transition-all duration-700 ${overBudget ? "bg-amber-400" : "bg-sky-400"}`}
            style={{ width: `${usedPct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
          <span>Quota usata</span>
          <span className="font-mono-num normal-case tracking-tight">{usedPct.toFixed(0)}%{overBudget ? " · oltre soglia" : ""}</span>
        </div>
      </div>

      {adding && (
        <div className="mt-5 p-4 border border-white/10 rounded-xl bg-white/[0.02]" data-testid="add-investment-form">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <input
              autoFocus
              type="text"
              placeholder="Settore o ETF (es. VWCE, Tech, S&P 500)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="sm:col-span-8 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-white outline-none placeholder:text-white/20"
              data-testid="investment-name-input"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="€ 0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="sm:col-span-4 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm font-mono-num focus:border-white outline-none placeholder:text-white/20"
              data-testid="investment-amount-input"
            />
          </div>
          <div className="mt-3 flex gap-2 justify-end">
            <button
              type="button"
              onClick={reset}
              className="text-sm text-neutral-400 hover:text-white px-3 py-1.5 inline-flex items-center gap-1"
              data-testid="investment-cancel-button"
            >
              <X className="w-3.5 h-3.5" /> Annulla
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="bg-white text-black font-medium text-sm px-4 py-1.5 rounded-full hover:bg-neutral-200 transition-colors active:scale-95 disabled:opacity-50"
              data-testid="investment-save-button"
            >
              Salva
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 flex-1" data-testid="investments-list">
        {items.length === 0 && !adding && (
          <div className="py-8 text-center text-sm text-neutral-600 border border-dashed border-white/10 rounded-xl">
            Nessun investimento questo mese.
          </div>
        )}
        {items.length > 0 && (
          <ul className="divide-y divide-white/5">
            {items.map((it) => (
              <li key={it.id} className="py-3 flex items-center justify-between group gap-3" data-testid={`investment-item-${it.id}`}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                  <span className="text-sm truncate">{it.name}</span>
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
      </div>
    </div>
  );
}
