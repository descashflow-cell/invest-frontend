import { useEffect, useState } from "react";
import { Plus, Check, Pencil, Trash2, X } from "lucide-react";
import { addIncome, updateIncome, deleteIncome } from "@/lib/api";
import { formatEUR } from "@/lib/format";
import { toast } from "sonner";

export default function SalaryCard({ month, items, onUpdated }) {
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingIds, setDeletingIds] = useState(() => new Set());
  const [editingIds, setEditingIds] = useState(() => new Set());
  const [editType, setEditType] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const total = items.reduce((s, i) => s + i.amount, 0);

  const reset = () => {
    setType("");
    setAmount("");
    setAdding(false);
  };

  const save = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0 || !type.trim()) {
      toast.error("Fill in a valid amount and type");
      return;
    }
    setSaving(true);
    try {
      await addIncome(month, { amount: num, type: type.trim() });
      toast.success("Salary updated");
      setAdding(false);
      onUpdated?.();
    } catch (e) {
      toast.error("Error saving salary");
    } finally {
      setSaving(false);
    }
  };

  const edit = async (id) => {
    const num = parseFloat(editAmount);
    if (isNaN(num) || num < 0 || !editType.trim()) {
      toast.error("Fill in a valid amount and type");
      return;
    }
    setSaving(true);
    try {
      await updateIncome(id, { amount: num, type: editType.trim() });
      toast.success("Income updated");
      setEditingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
      onUpdated?.();
    } catch (e) {
      toast.error("Error updating income");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (deletingIds.has(id)) return;
    setDeletingIds((s) => new Set(s).add(id));
    try {
      await deleteIncome(id);
      toast.success("Income deleted");
      onUpdated?.();
    } catch (e) {
      if (e?.response?.status === 404) {
        // already gone — treat as success
        onUpdated?.();
      } else {
        toast.error("Error deleting income");
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
      data-testid="salary-card"
      className="relative overflow-hidden bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 h-full flex flex-col justify-between min-h-[260px]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500 mb-2">
            Monthly Incomes
          </p>
          <div
            className="font-mono-num text-5xl sm:text-6xl tracking-tight leading-none text-emerald-400"
            data-testid="incomes-total"
          >
            {formatEUR(total)}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {items.length} {items.length === 1 ? "income item" : "income items"}
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="border border-white/10 bg-transparent text-white px-4 py-2 rounded-full hover:bg-white/5 transition-colors active:scale-95 inline-flex items-center gap-1.5 text-sm"
            data-testid="add-salary-button"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>

      {adding && (
        <div
          className="mt-5 p-4 border border-white/10 rounded-xl bg-white/[0.02]"
          data-testid="add-fixed-form"
        >
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              autoFocus
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
            <input
              type="text"
              placeholder="E.g. Salary, Bonus..."
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="sm:col-span-3 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-white outline-none placeholder:text-white/20"
              data-testid="fixed-name-input"
            />
          </div>
          <div className="mt-3 flex gap-2 justify-end">
            <button
              type="button"
              onClick={reset}
              className="text-sm text-neutral-400 hover:text-white px-3 py-1.5 inline-flex items-center gap-1"
              data-testid="fixed-cancel-button"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="bg-white text-black font-medium text-sm px-4 py-1.5 rounded-full hover:bg-neutral-200 transition-colors active:scale-95 disabled:opacity-50"
              data-testid="fixed-save-button"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div
        className="mt-5 flex-1 overflow-y-auto -mx-2"
        data-testid="incomes-list"
      >
        {items.length === 0 && !adding && (
          <div className="px-2 py-10 text-center text-sm text-neutral-600 border border-dashed border-white/10 rounded-xl">
            No incomes.
            <br />
            Add salary, bonuses, other sources…
          </div>
        )}
        <ul className="divide-y divide-white/5">
          {items.map((it) => (
            <li
              key={it.id}
              className="px-2 py-3 flex items-center justify-between group"
              data-testid={`incomes-item-${it.id}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 flex-shrink-0" />
                {!editingIds.has(it.id) && (
                  <span className="text-sm truncate">{it.type}</span>
                )}
                {editingIds.has(it.id) && (
                  <input
                    type="text"
                    placeholder="E.g. Salary, Bonus..."
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="sm:col-span-3 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-white outline-none placeholder:text-white/20"
                    data-testid="fixed-name-input"
                  />
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {!editingIds.has(it.id) && (
                  <>
                    <span className="font-mono-num text-sm text-neutral-300">
                      {formatEUR(it.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIds(new Set(editingIds).add(it.id));
                        setEditType(it.type);
                        setEditAmount(it.amount);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      data-testid={`incomes-edit-${it.id}`}
                      aria-label="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(it.id)}
                      disabled={deletingIds.has(it.id)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      data-testid={`incomes-delete-${it.id}`}
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                {editingIds.has(it.id) && (
                  <>
                    <input
                      autoFocus
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="€ 0,00"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && edit(it.id)}
                      className="sm:col-span-2 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm font-mono-num focus:border-white outline-none placeholder:text-white/20"
                      data-testid="fixed-amount-input"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIds((s) => {
                          const next = new Set(s);
                          next.delete(it.id);
                          return next;
                        });
                        setEditType('');
                        setEditAmount('');
                      }}
                      className="text-neutral-500 hover:text-red-400 transition-all"
                      data-testid={`incomes-edit-${it.id}`}
                      aria-label="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => edit(it.id)}
                      className="text-neutral-500 hover:text-emerald-400 transition-all"
                      data-testid={`incomes-edit-${it.id}`}
                      aria-label="Edit"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
