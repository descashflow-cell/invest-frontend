import { useState } from "react";
import { Plus, Trash2, X, Copy, Pencil, Check } from "lucide-react";
import {
  addFixedExpense,
  deleteFixedExpense,
  copyFixedExpense,
  updateFixedExpense,
} from "@/lib/api";
import { formatEUR } from "@/lib/format";
import { toast } from "sonner";

export default function FixedExpensesCard({ month, items, onChanged }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [deletingIds, setDeletingIds] = useState(() => new Set());
  const [editingIds, setEditingIds] = useState(() => new Set());
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const total = items.reduce((s, i) => s + i.amount, 0);

  const reset = () => {
    setName("");
    setAmount("");
    setAdding(false);
  };

  const save = async () => {
    const num = parseFloat(amount);
    if (!name.trim() || isNaN(num) || num <= 0) {
      toast.error("Fill in name and amount");
      return;
    }
    setSaving(true);
    try {
      await addFixedExpense(month, { name: name.trim(), amount: num });
      toast.success("Fixed expense added");
      reset();
      onChanged?.();
    } catch (e) {
      toast.error("Error adding fixed expense");
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    setCopying(true);
    try {
      await copyFixedExpense(month);
      toast.success("Fixed expenses copied from last month");
      onChanged?.();
    } catch (e) {
      if (e.response?.data?.detail) {
        switch (e.response.data.detail) {
          case "FIXED_EXPENSES_ALREADY_EXIST":
            toast.error(
              "You have already inserted some fixed expenses for this month",
            );
            break;
          case "NO_FIXED_EXPENSES_TO_COPY":
            toast.error("No fixed expenses to copy from last month");
            break;
          default:
            toast.error("Error copying fixed expenses");
        }
      } else {
        toast.error("Error copying fixed expenses");
      }
    } finally {
      setCopying(false);
    }
  };

  const edit = async (id) => {
    const num = parseFloat(editAmount);
    if (isNaN(num) || num < 0 || !editName.trim()) {
      toast.error("Fill in a valid amount and name");
      return;
    }
    setSaving(true);
    try {
      await updateFixedExpense(id, { amount: num, name: editName.trim() });
      toast.success("Fixed expense updated");
      setEditingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
      onChanged?.();
    } catch (e) {
      toast.error("Error updating fixed expense");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (deletingIds.has(id)) return;
    setDeletingIds((s) => new Set(s).add(id));
    try {
      await deleteFixedExpense(id);
      toast.success("Fixed expense deleted");
      onChanged?.();
    } catch (e) {
      if (e?.response?.status === 404) {
        // already gone — treat as success
        onChanged?.();
      } else {
        toast.error("Error deleting fixed expense");
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
            Fixed Expenses
          </p>
          <div
            className="font-mono-num text-3xl sm:text-4xl tracking-tight text-white"
            data-testid="fixed-total"
          >
            {formatEUR(total)}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {items.length}{" "}
            {items.length === 1 ? "recurring item" : "recurring items"}
          </p>
        </div>
        {!adding && !copying && (
          <>
            <button
              type="button"
              onClick={copy}
              className="border border-white/10 bg-transparent text-white px-4 py-2 rounded-full hover:bg-white/5 transition-colors active:scale-95 inline-flex items-center gap-1.5 text-sm"
              data-testid="copy-fixed-button"
            >
              <Copy className="w-3.5 h-3.5" /> Copy from last month
            </button>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="border border-white/10 bg-transparent text-white px-4 py-2 rounded-full hover:bg-white/5 transition-colors active:scale-95 inline-flex items-center gap-1.5 text-sm"
              data-testid="add-fixed-button"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </>
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
              placeholder="E.g. Rent, Bills..."
              value={name}
              onChange={(e) => setName(e.target.value)}
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
        data-testid="fixed-list"
      >
        {items.length === 0 && !adding && (
          <div className="px-2 py-10 text-center text-sm text-neutral-600 border border-dashed border-white/10 rounded-xl">
            No fixed expenses.
            <br />
            Add rent, bills, subscriptions…
          </div>
        )}
        <ul className="divide-y divide-white/5">
          {items.map((it) => (
            <li
              key={it.id}
              className="px-2 py-3 flex items-center justify-between group"
              data-testid={`fixed-item-${it.id}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/80 flex-shrink-0" />
                {!editingIds.has(it.id) && (
                  <span className="text-sm truncate">{it.name}</span>
                )}
                {editingIds.has(it.id) && (
                  <input
                    type="text"
                    placeholder="E.g. Rent, Bills..."
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
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
                        setEditName(it.name);
                        setEditAmount(it.amount);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      data-testid={`fixed-edit-${it.id}`}
                      aria-label="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
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
                        setEditName("");
                        setEditAmount("");
                      }}
                      className="text-neutral-500 hover:text-red-400 transition-all"
                      data-testid={`fixed-cancel-${it.id}`}
                      aria-label="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => edit(it.id)}
                      className="text-neutral-500 hover:text-emerald-400 transition-all"
                      data-testid={`fixed-edit-${it.id}`}
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
