"use client";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import type { ExpenseDTO } from "@/lib/types";
import { categoryMeta } from "@/lib/constants";
import { CategoryIcon, ModeBadge } from "@/components/ui/Icon";
import { useApp } from "@/components/layout/AppProviders";
import { money, relativeDay } from "@/lib/client/format";

export function ExpenseRow({ e, i = 0, showDate = false }: { e: ExpenseDTO; i?: number; showDate?: boolean }) {
  const { openEdit } = useApp();
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: Math.min(i * 0.035, 0.4) }}
      onClick={() => openEdit(e)}
      className="group flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition hover:bg-white/60 hover:shadow-[0_6px_20px_-10px_rgba(76,70,140,0.25)]"
    >
      <CategoryIcon category={e.category} size={42} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14.5px] font-semibold text-ink">{e.note}</p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
          <span>{categoryMeta(e.category).label}</span>
          {showDate && (
            <>
              <span className="h-1 w-1 rounded-full bg-ink-faint" />
              <span>{relativeDay(e.date)}</span>
            </>
          )}
        </p>
      </div>
      <ModeBadge mode={e.paymentMode} className="hidden sm:inline-flex" />
      <span className="num w-24 text-right font-display text-[15px] font-semibold text-ink">−{money(e.amount, e.amount % 1 !== 0)}</span>
      <Pencil size={15} className="text-ink-faint opacity-0 transition group-hover:opacity-100" />
    </motion.button>
  );
}
