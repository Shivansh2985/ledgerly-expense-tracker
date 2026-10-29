"use client";
import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/client/cn";

export function Segmented<T extends string>({ value, onChange, options, className, size = "md" }: { value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; className?: string; size?: "sm" | "md" }) {
  const id = useId();
  return (
    <div className={cn("neu-inset inline-flex gap-1 rounded-2xl p-1.5", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn("relative rounded-xl font-semibold transition-colors", size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm", active ? "text-brand-600" : "text-ink-muted hover:text-ink")}
          >
            {active && <motion.span layoutId={"seg-" + id} className="absolute inset-0 rounded-xl bg-white shadow-[0_4px_14px_-4px_rgba(108,92,231,0.35)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative z-10 flex items-center gap-1.5">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
