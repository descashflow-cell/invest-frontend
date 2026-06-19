import { useEffect, useState } from "react";
import { Check, Pencil } from "lucide-react";
import { setSalary } from "@/lib/api";
import { formatEUR } from "@/lib/format";
import { toast } from "sonner";

export default function SalaryCard({ month, amount, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(amount || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(amount || "");
  }, [amount, month]);

  const save = async () => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      toast.error("Inserisci un importo valido");
      return;
    }
    setSaving(true);
    try {
      await setSalary(month, num);
      toast.success("Stipendio aggiornato");
      setEditing(false);
      onUpdated?.();
    } catch (e) {
      toast.error("Errore nel salvataggio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      data-testid="salary-card"
      className="relative overflow-hidden bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 h-full flex flex-col justify-between min-h-[260px]"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500">
          Stipendio mensile
        </p>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-neutral-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
            data-testid="salary-edit-button"
          >
            <Pencil className="w-3.5 h-3.5" />
            Modifica
          </button>
        )}
      </div>

      {!editing ? (
        <div className="mt-6">
          <div className="font-mono-num text-5xl sm:text-6xl tracking-tight leading-none text-emerald-400" data-testid="salary-amount">
            {formatEUR(amount || 0)}
          </div>
          <p className="mt-3 text-sm text-neutral-500">
            {amount > 0 ? "Entrata mensile registrata" : "Imposta il tuo stipendio per iniziare"}
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex items-baseline gap-3">
            <span className="font-mono-num text-4xl text-neutral-500">€</span>
            <input
              autoFocus
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder="0,00"
              className="bg-transparent border-0 border-b border-white/30 focus:border-white outline-none px-0 py-2 font-mono-num text-4xl sm:text-5xl tracking-tight w-full placeholder:text-white/10"
              data-testid="salary-input"
            />
          </div>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="bg-white text-black font-medium px-5 py-2.5 rounded-full hover:bg-neutral-200 transition-colors active:scale-95 inline-flex items-center gap-2 disabled:opacity-50"
              data-testid="salary-save-button"
            >
              <Check className="w-4 h-4" /> Salva
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setValue(amount || ""); }}
              className="border border-white/10 px-5 py-2.5 rounded-full hover:bg-white/5 transition-colors active:scale-95"
              data-testid="salary-cancel-button"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between text-xs text-neutral-500">
        <span className="uppercase tracking-[0.2em] font-bold">Entrate</span>
        <span className="font-mono-num">EUR · mensile</span>
      </div>
    </div>
  );
}
