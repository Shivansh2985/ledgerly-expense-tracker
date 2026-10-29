"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, IndianRupee, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { CategoryIcon, iconFor } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { CATEGORIES, PAYMENT_MODES, type CategoryKey, type PaymentModeKey } from "@/lib/constants";
import type { ExpenseDTO } from "@/lib/types";
import { api, notifyExpensesChanged } from "@/lib/client/api";
import { toDay, shiftDay } from "@/lib/client/format";
import { cn } from "@/lib/client/cn";

type FormState = { amount: string; category: CategoryKey; paymentMode: PaymentModeKey; note: string; date: string };
const QUICK_NOTES: Partial<Record<CategoryKey, string[]>> = {
  food: ["Lunch", "Morning chai", "Swiggy dinner", "Coffee"],
  groceries: ["Weekly groceries", "Vegetables", "Milk & bread"],
  transport: ["Metro", "Auto rickshaw", "Uber ride", "Fuel"],
  shopping: ["Clothes", "Amazon order", "Electronics"],
  bills: ["Electricity bill", "Mobile recharge", "Wi-Fi bill"],
  entertainment: ["Movie tickets", "Netflix", "Concert"],
  health: ["Pharmacy", "Gym membership", "Doctor visit"],
};

function initial(expense?: ExpenseDTO, defaults?: Partial<ExpenseDTO>): FormState {
  const src = expense ?? defaults;
  return {
    amount: src?.amount ? String(src.amount) : "",
    category: (src?.category as CategoryKey) ?? "food",
    paymentMode: (src?.paymentMode as PaymentModeKey) ?? "upi",
    note: src?.note ?? "",
    date: src?.date ?? toDay(),
  };
}

export function ExpenseModal({ open, onClose, expense, defaults }: { open: boolean; onClose: () => void; expense?: ExpenseDTO; defaults?: Partial<ExpenseDTO> }) {
  const [form, setForm] = useState<FormState>(initial(expense, defaults));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const editing = !!expense;

  useEffect(() => {
    if (open) {
      setForm(initial(expense, defaults));
      setError(null);
    }
  }, [open, expense, defaults]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return setError("Enter a valid amount");
    if (!form.note.trim()) return setError("Add a short note about this expense");
    setSaving(true);
    try {
      const body = { ...form, amount, note: form.note.trim() };
      if (editing) await api(`/api/expenses/${expense!.id}`, { method: "PATCH", json: body });
      else await api("/api/expenses", { method: "POST", json: body });
      notifyExpensesChanged();
      toast(editing ? "Expense updated" : "Expense added");
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!expense) return;
    setDeleting(true);
    try {
      await api(`/api/expenses/${expense.id}`, { method: "DELETE" });
      notifyExpensesChanged();
      toast("Expense deleted");
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  const today = toDay();
  const quick = QUICK_NOTES[form.category] ?? [];

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit expense" : "Add expense"} subtitle={editing ? "Update the details of this transaction." : "Log what you spent, how you paid, and why."} width={620}>
      <form onSubmit={submit} className="space-y-6">
        <div className="neu-inset flex items-center gap-3 rounded-3xl px-5 py-4">
          <IndianRupee size={28} className="text-brand-500" strokeWidth={2.4} />
          <input
            autoFocus
            inputMode="decimal"
            placeholder="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^0-9.]/g, "") })}
            className="num w-full bg-transparent font-display text-[40px] font-semibold tracking-tight text-ink outline-none placeholder:text-ink-faint"
            aria-label="Amount"
          />
        </div>

        <div>
          <p className="label mb-3">Category</p>
          <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-7">
            {CATEGORIES.map((c) => {
              const active = form.category === c.key;
              return (
                <motion.button
                  type="button"
                  key={c.key}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setForm({ ...form, category: c.key })}
                  className={cn("flex flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5 text-[10.5px] font-semibold leading-tight transition-all", active ? "bg-white text-ink shadow-[0_8px_20px_-8px_rgba(108,92,231,0.45)] ring-2 ring-brand-300" : "text-ink-muted hover:bg-white/50")}
                >
                  <CategoryIcon category={c.key} size={34} />
                  <span className="line-clamp-1 text-center">{c.label.split(" ")[0]}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="label mb-3">Payment mode</p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_MODES.map((m) => {
              const I = iconFor(m.icon);
              const active = form.paymentMode === m.key;
              return (
                <button
                  type="button"
                  key={m.key}
                  onClick={() => setForm({ ...form, paymentMode: m.key })}
                  className={cn("inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all", active ? "text-white" : "bg-canvas text-ink-soft shadow-neu-sm hover:text-ink")}
                  style={active ? { background: `linear-gradient(135deg, ${m.color}, ${m.color}cc)`, boxShadow: `0 10px 22px -10px ${m.color}` } : undefined}
                >
                  <I size={16} /> {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
          <Field label="Note — what was it for?">
            <Input placeholder="e.g. Dinner with friends" value={form.note} maxLength={200} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Field>
          <Field label="Date">
            <Input type="date" icon={<Calendar size={16} />} value={form.date} max={today} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
        </div>
        <div className="-mt-2 flex flex-wrap gap-2">
          {quick.map((q) => (
            <button type="button" key={q} onClick={() => setForm({ ...form, note: q })} className="glass rounded-full px-3 py-1 text-xs font-semibold text-ink-soft transition hover:text-brand-600">
              {q}
            </button>
          ))}
          <span className="mx-1 h-6 w-px bg-ink-faint/40" />
          {[{ l: "Today", d: today }, { l: "Yesterday", d: shiftDay(today, -1) }].map((q) => (
            <button type="button" key={q.l} onClick={() => setForm({ ...form, date: q.d })} className={cn("rounded-full px-3 py-1 text-xs font-semibold transition", form.date === q.d ? "bg-brand-500 text-white" : "glass text-ink-soft hover:text-brand-600")}>
              {q.l}
            </button>
          ))}
        </div>

        {error && <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm font-medium text-[#D9483B]">{error}</p>}

        <div className="flex items-center gap-3 pt-1">
          {editing && (
            <Button type="button" variant="neu" onClick={remove} loading={deleting} className="text-coral hover:text-coral">
              <Trash2 size={16} /> Delete
            </Button>
          )}
          <div className="ml-auto flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="px-7">
              {editing ? "Save changes" : "Add expense"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
