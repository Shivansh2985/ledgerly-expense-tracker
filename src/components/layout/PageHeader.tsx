"use client";
import { motion } from "framer-motion";

export function PageHeader({ eyebrow, title, subtitle, right }: { eyebrow?: string; title: React.ReactNode; subtitle?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="label mb-2">{eyebrow}</p>}
        <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[34px]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-3">{right}</div>}
    </motion.div>
  );
}
