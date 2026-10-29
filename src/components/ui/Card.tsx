"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/client/cn";

type Variant = "glass" | "neu" | "glass-strong";

export function Card({ variant = "glass", className, delay = 0, children, ...rest }: HTMLMotionProps<"div"> & { variant?: Variant; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(variant, "relative p-5 sm:p-6", className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ title, subtitle, right, className }: { title: React.ReactNode; subtitle?: React.ReactNode; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-5 flex items-start justify-between gap-3", className)}>
      <div>
        <h3 className="font-display text-[15px] font-semibold tracking-tight text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[12.5px] text-ink-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
