"use client";
import { motion } from "framer-motion";
import type { AnalyticsResponse } from "@/lib/types";
import { CategoryIcon } from "@/components/ui/Icon";
import { money } from "@/lib/client/format";

export function TopNotes({ data }: { data: AnalyticsResponse["topNotes"] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="space-y-2.5">
      {data.map((n, i) => (
        <motion.div key={n.note + i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white/50">
          <span className="w-5 text-center font-display text-xs font-semibold text-ink-faint">{i + 1}</span>
          <CategoryIcon category={n.category} size={36} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 text-[13.5px]">
              <span className="truncate font-semibold capitalize text-ink">{n.note}</span>
              <span className="num shrink-0 font-semibold text-ink">{money(n.total)}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#DDE1EC]">
                <motion.div className="h-full rounded-full bg-[linear-gradient(90deg,#A99CF6,#6C5CE7)]" initial={{ width: 0 }} animate={{ width: (n.total / max) * 100 + "%" }} transition={{ duration: 1, delay: 0.2 + i * 0.05 }} />
              </div>
              <span className="text-[11px] font-medium text-ink-muted">{n.count}×</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
