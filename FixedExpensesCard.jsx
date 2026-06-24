import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { addFixedExpense, deleteFixedExpense } from "@/lib/api";
import { formatEUR } from "@/lib/format";
import { toast } from "sonner";

export default function FixedExpensesCard({ month, items, onChanged }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingIds, setDeletingIds] = useState(() => new Set());

  const total = items.reduce((s, i) => s + i.amount, 0);

  const reset = () => { setName(""); setAmount(""); setAdding(false); };

  const save = async () => {
    const num = parseFloat(amount);
    if (!name.trim() || isNaN(num) || num <= 0) {
      toast.error("Compila nome e importo");
      return;
    }
    setSaving(true);
    try {
      await addFixedExpense(month, { name: name.trim(), amount: num });
      toast.success("Spesa fissa aggiunta");
      reset();
      onChanged?.();
    } catch (e) {
      toast.error("Errore nell'aggiunta");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (deletingIds.has(id)) return;
    setDeletingIds((s) => new Set(s).add(id));
    try {
      await deleteFixedExpense(id);
      toast.success("Spesa eliminata");
      onChanged?.();
    } catch (e) {
      if (e?.response?.status === 404) {
        // already gone — treat as success
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
      data-testid="fixed-expenses-card"
      className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 h-full flex flex-col min-h-[340px]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-2">
            Spese Fisse
          </p>
          <div className="font-mono-num text-3xl sm:text-4xl tracking-tight text-white" data-testid="fixed-total">
            {formatEUR(total)}
          </div>
          <p className="text-xs text-neutral-500 mt-1">{items.length} {items.length === 1 ? "voce ricorrente" : "voci ricorrenti"}</p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="border border-white/10 bg-transparent text-white px-4 py-2 rounded-full hover:bg-white/5 transition-colors active:scale-95 inline-flex items-center gap-1.5 text-sm"
            data-testid="add-fixed-button"
          >
            <Plus className="w-3.5 h-3.5" /> Aggiungi
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-5 p-4 border border-white/10 rounded-xl bg-white/[0.02]" data-testid="add-fixed-form">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              autoFocus
              type="text"
              placeholder="Es. Affitto, Bollette..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="sm:col-span-3 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-white outline-none placeholder:text-white/20"
              data-testid="fixed-name-input"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="€ 0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="sm:col-span-2 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm font-mono-num focus:border-white outline-none placeholder:text-white/20"
              data-testid="fixed-amount-input"
            />
          </div>
          <div className="mt-3 flex gap-2 justify-end">
            <button
              type="button"
              onClick={reset}
              className="text-sm text-neutral-400 hover:text-white px-3 py-1.5 inline-flex items-center gap-1"
              data-testid="fixed-cancel-button"
            >
              <X className="w-3.5 h-3.5" /> Annulla
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="bg-white text-black font-medium text-sm px-4 py-1.5 rounded-full hover:bg-neutral-200 transition-colors active:scale-95 disabled:opacity-50"
              data-testid="fixed-save-button"
            >
              Salva
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 flex-1 overflow-y-auto -mx-2" data-testid="fixed-list">
        {items.length === 0 && !adding && (
          <div className="px-2 py-10 text-center text-sm text-neutral-600 border border-dashed border-white/10 rounded-xl">
            Nessuna spesa fissa.<br />Aggiungi affitto, bollette, abbonamenti…
          </div>
        )}
        <ul className="divide-y divide-white/5">
          {items.map((it) => (
            <li key={it.id} className="px-2 py-3 flex items-center justify-between group" data-testid={`fixed-item-${it.id}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/80 flex-shrink-0" />
                <span className="text-sm truncate">{it.name}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-mono-num text-sm text-neutral-300">{formatEUR(it.amount)}</span>
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  disabled={deletingIds.has(it.id)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  data-testid={`fixed-delete-${it.id}`}
                  aria-label="Elimina"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
