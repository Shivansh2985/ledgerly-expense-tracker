"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/client/cn";

type Variant = "primary" | "neu" | "ghost" | "danger";
const styles: Record<Variant, string> = {
  primary: "text-white shadow-glow bg-[linear-gradient(135deg,#7B6CF0_0%,#6C5CE7_45%,#5847D1_100%)] hover:brightness-110",
  neu: "bg-canvas text-ink shadow-neu-sm hover:text-brand-600 active:shadow-neu-inset-sm",
  ghost: "text-ink-soft hover:bg-white/60 hover:text-ink",
  danger: "text-white bg-[linear-gradient(135deg,#FF8A7A,#F25F5C)] shadow-[0_10px_24px_-8px_rgba(242,95,92,0.6)] hover:brightness-105",
};

export function Button({ variant = "primary", loading, className, children, disabled, ...rest }: HTMLMotionProps<"button"> & { variant?: Variant; loading?: boolean }) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-[filter,box-shadow,color,background] disabled:cursor-not-allowed disabled:opacity-60",
        styles[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children as React.ReactNode}
    </motion.button>
  );
}

export function IconButton({ className, children, ...rest }: HTMLMotionProps<"button">) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.92 }}
      className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl bg-canvas text-ink-soft shadow-neu-sm transition hover:text-brand-600 active:shadow-neu-inset-sm", className)}
      {...rest}
    >
      {children as React.ReactNode}
    </motion.button>
  );
}
