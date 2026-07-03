import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { addExtraExpense, deleteExtraExpense } from "@/lib/api";
import { formatEUR } from "@/lib/format";
import { toast } from "sonner";

export default function ExtraExpensesCard({ month, items, onChanged }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingIds, setDeletingIds] = useState(() => new Set());

  const total = items.reduce((s, i) => s + i.amount, 0);

  const reset = () => { setName(""); setAmount(""); setCategory(""); setAdding(false); };

  const save = async () => {
    const num = parseFloat(amount);
    if (!name.trim() || isNaN(num) || num <= 0 || !category.trim()) {
      toast.error("Fill in all fields");
      return;
    }
    setSaving(true);
    try {
      await addExtraExpense({
        name: name.trim(),
        amount: num,
        category: category.trim(),
        month,
      });
      toast.success("Expense added");
      reset();
      onChanged?.();
    } catch {
      toast.error("Error adding expense");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (deletingIds.has(id)) return;
    setDeletingIds((s) => new Set(s).add(id));
    try {
      await deleteExtraExpense(id);
      toast.success("Expense deleted");
      onChanged?.();
    } catch (e) {
      if (e?.response?.status === 404) {
        onChanged?.();
      } else {
        toast.error("Error deleting expense");
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
      data-testid="extra-expenses-card"
      className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 h-full flex flex-col"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-2">
            Extra Expenses · of the Month
          </p>
          <div className="font-mono-num text-3xl sm:text-4xl tracking-tight" data-testid="extra-total">
            {formatEUR(total)}
          </div>
          <p className="text-xs text-neutral-500 mt-1">{items.length} {items.length === 1 ? "transaction" : "transactions"}</p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="bg-white text-black font-medium px-5 py-2.5 rounded-full hover:bg-neutral-200 transition-colors active:scale-95 inline-flex items-center gap-1.5 text-sm"
            data-testid="add-extra-button"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-5 p-4 border border-white/10 rounded-xl bg-white/[0.02]" data-testid="add-extra-form">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <input
              autoFocus
              type="number"
              step="0.01"
              min="0"
              placeholder="€ 0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="sm:col-span-3 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm font-mono-num focus:border-white outline-none placeholder:text-white/20"
              data-testid="extra-amount-input"
            />
            <input
              type="text"
              placeholder="Description"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="sm:col-span-5 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-white outline-none placeholder:text-white/20"
              data-testid="extra-name-input"
            />
            <input
              type="text"
              placeholder="Category (e.g. food)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="sm:col-span-4 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-white outline-none placeholder:text-white/20"
              data-testid="extra-category-input"
            />
          </div>
          <div className="mt-3 flex gap-2 justify-end">
            <button
              type="button"
              onClick={reset}
              className="text-sm text-neutral-400 hover:text-white px-3 py-1.5 inline-flex items-center gap-1"
              data-testid="extra-cancel-button"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="bg-white text-black font-medium text-sm px-4 py-1.5 rounded-full hover:bg-neutral-200 transition-colors active:scale-95 disabled:opacity-50"
              data-testid="extra-save-button"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="mt-5" data-testid="extra-list">
        {items.length === 0 && !adding && (
          <div className="py-10 text-center text-sm text-neutral-600 border border-dashed border-white/10 rounded-xl">
            No extra expenses this month.
          </div>
        )}
        {items.length > 0 && (
          <ul className="divide-y divide-white/5">
            {items.map((it) => (
              <li key={it.id} className="py-3.5 flex items-center justify-between group gap-4" data-testid={`extra-item-${it.id}`}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
                  <span className="text-sm truncate">{it.name}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 px-2 py-0.5 border border-white/10 rounded-full flex-shrink-0">
                    {it.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="font-mono-num text-sm text-neutral-300">{formatEUR(it.amount)}</span>
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    disabled={deletingIds.has(it.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    data-testid={`extra-delete-${it.id}`}
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
