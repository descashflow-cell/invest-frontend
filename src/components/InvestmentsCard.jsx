import { useState } from "react";
import { Plus, Trash2, X, Pencil, Check } from "lucide-react";
import { addInvestment, deleteInvestment, updateInvestment } from "@/lib/api";
import { formatEUR, capitalize } from "@/lib/format";
import { toast } from "sonner";
import { INV_COLORS } from "@/lib/utils";
import Autocomplete from "./Autocomplete";

export default function InvestmentsCard({
  month,
  items,
  suggested,
  totalMonth,
  onChanged,
  categories,
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingIds, setDeletingIds] = useState(() => new Set());
  const [editingIds, setEditingIds] = useState(() => new Set());
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState("");

  const reset = () => {
    setName("");
    setAmount("");
    setType("");
    setAdding(false);
  };

  const usedPct =
    suggested > 0 ? Math.min(100, (totalMonth / suggested) * 100) : 0;
  const overBudget = totalMonth > suggested && suggested > 0;

  const investments = items || [];
  const totalByType = new Map();
  investments.forEach((elem) => {
    totalByType.set(elem.name, (totalByType.get(elem.name) ?? 0) + elem.amount);
  });
  const orderedTotalByType = new Map(
    [...totalByType.entries()].sort(([, a], [, b]) => b - a),
  );
  const typeIndex = new Map(
    [...orderedTotalByType.keys()].map((key, i) => [key, i]),
  );

  const save = async () => {
    const num = parseFloat(amount);
    if (!name.trim() || isNaN(num) || num <= 0 || !type) {
      toast.error("Fill in sector/ETF, type, and amount");
      return;
    }
    setSaving(true);
    try {
      await addInvestment({ name: name.trim(), amount: num, month, type });
      toast.success("Investment added");
      reset();
      onChanged?.();
    } catch {
      toast.error("Error adding investment");
    } finally {
      setSaving(false);
    }
  };

  const edit = async (id) => {
    const num = parseFloat(editAmount);
    if (isNaN(num) || num < 0 || !editName.trim() || !editType) {
      toast.error("Fill in a valid amount, name, and type");
      return;
    }
    setSaving(true);
    try {
      await updateInvestment(id, {
        amount: num,
        name: editName.trim(),
        type: editType,
        month,
      });
      toast.success("Investment updated");
      setEditingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
      onChanged?.();
    } catch (e) {
      toast.error("Error updating investment");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (deletingIds.has(id)) return;
    setDeletingIds((s) => new Set(s).add(id));
    try {
      await deleteInvestment(id);
      toast.success("Investment removed");
      onChanged?.();
    } catch (e) {
      if (e?.response?.status === 404) {
        onChanged?.();
      } else {
        toast.error("Error deleting investment");
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
            Monthly Investments
          </p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <div
              className="font-mono-num text-3xl sm:text-4xl tracking-tight text-sky-400"
              data-testid="investments-total"
            >
              {formatEUR(totalMonth)}
            </div>
          </div>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="bg-sky-400 text-black font-medium px-5 py-2.5 rounded-full hover:bg-sky-300 transition-colors active:scale-95 inline-flex items-center gap-1.5 text-sm flex-shrink-0"
            data-testid="add-investment-button"
          >
            <Plus className="w-4 h-4" /> Invest
          </button>
        )}
      </div>

      {adding && (
        <div
          className="mt-5 p-4 border border-white/10 rounded-xl bg-white/[0.02]"
          data-testid="add-investment-form"
        >
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
              data-testid="investment-amount-input"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="sm:col-span-4 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-white outline-none placeholder:text-white/20"
              data-testid="investment-type-select"
            >
              <option value="" className="text-black">
                Select type
              </option>
              {["Monthly", "Extra"].map((type) => (
                <option
                  key={type}
                  value={type.toLowerCase()}
                  className="text-black"
                >
                  {type}
                </option>
              ))}
            </select>
            <Autocomplete
              items={categories.investments_names}
              valueFrom={name}
              onChange={setName}
              placeholder="Sector or ETF (e.g., VWCE, Tech, S&P 500)"
            />
          </div>
          <div className="mt-3 flex gap-2 justify-end">
            <button
              type="button"
              onClick={reset}
              className="text-sm text-neutral-400 hover:text-white px-3 py-1.5 inline-flex items-center gap-1"
              data-testid="investment-cancel-button"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="bg-white text-black font-medium text-sm px-4 py-1.5 rounded-full hover:bg-neutral-200 transition-colors active:scale-95 disabled:opacity-50"
              data-testid="investment-save-button"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 flex-1" data-testid="investments-list">
        {items.length === 0 && !adding && (
          <div className="py-8 text-center text-sm text-neutral-600 border border-dashed border-white/10 rounded-xl">
            No investments this month.
          </div>
        )}
        {items.length > 0 && (
          <ul className="divide-y divide-white/5">
            {items.map((it) => (
              <li
                key={it.id}
                className={`py-3 grid ${editingIds.has(it.id) ? 'grid-cols-1' : 'grid-cols-3'} group gap-3`}
                data-testid={`investment-item-${it.id}`}
              >
                {editingIds.has(it.id) && (
                  <div
                    className="mt-5 p-4 border border-white/10 rounded-xl bg-white/[0.02] sm:flex sm:gap-3"
                    data-testid="add-investment-form"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <Autocomplete
                        items={categories.investments_names}
                        valueFrom={editName}
                        onChange={setEditName}
                        placeholder="Sector or ETF (e.g., VWCE, Tech, S&P 500)"
                      />
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                        className="sm:col-span-4 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-white outline-none placeholder:text-white/20"
                        data-testid="investment-type-select"
                      >
                        <option value="" className="text-black">
                          Select type
                        </option>
                        {["Monthly", "Extra"].map((type) => (
                          <option
                            key={type}
                            value={type.toLowerCase()}
                            className="text-black"
                          >
                            {type}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="€ 0,00"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && edit(it.id)}
                        className="sm:col-span-3 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm font-mono-num focus:border-white outline-none placeholder:text-white/20"
                        data-testid="investment-amount-input"
                      />
                    </div>
                    <div className="flex gap-2 justify-end mt-2 sm:mt-0">
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
                          setEditType("");
                        }}
                        className="text-sm text-neutral-400 hover:text-white px-3 py-1.5 inline-flex items-center gap-1"
                        data-testid="investment-cancel-button"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => edit(it.id)}
                        disabled={saving}
                        className="bg-white text-black font-medium text-sm px-4 py-1.5 rounded-full hover:bg-neutral-200 transition-colors active:scale-95 disabled:opacity-50 inline-flex items-center gap-1"
                        data-testid="investment-save-button"
                      >
                        <Check className="w-3.5 h-3.5" /> Update
                      </button>
                    </div>
                  </div>
                )}
                {!editingIds.has(it.id) && (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0`}
                        style={{
                          backgroundColor:
                            INV_COLORS[
                              (typeIndex.get(it.name) ?? 0) % INV_COLORS.length
                            ],
                        }}
                      />
                      <span className="text-sm">{it.name}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-sm">
                        {capitalize(it.type) || "Monthly"}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-mono-num text-sm text-neutral-300">
                        {formatEUR(it.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIds(new Set(editingIds).add(it.id));
                          setEditName(it.name);
                          setEditAmount(it.amount);
                          setEditType(it.type);
                        }}
                        className="sm:opacity-0 sm:group-hover:opacity-100 text-emerald-400 sm:text-neutral-500 sm:hover:text-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        data-testid={`investment-edit-${it.id}`}
                        aria-label="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(it.id)}
                        disabled={deletingIds.has(it.id)}
                        className="sm:opacity-0 sm:group-hover:opacity-100 text-red-400 sm:text-neutral-500 sm:hover:text-red-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        data-testid={`investment-delete-${it.id}`}
                        aria-label="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
