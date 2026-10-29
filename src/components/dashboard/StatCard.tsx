"use client";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Sparkline } from "@/components/charts/Sparkline";
import { cn } from "@/lib/client/cn";

export function StatCard({ label, value, format, icon: Icon, color, change, caption, spark, delay = 0, variant = "glass" }: { label: string; value: number; format: (n: number) => string; icon: LucideIcon; color: string; change?: number | null; caption?: string; spark?: number[]; delay?: number; variant?: "glass" | "neu" }) {
  const up = (change ?? 0) > 0;
  return (
    <Card variant={variant} delay={delay} className="overflow-hidden">
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `linear-gradient(145deg, ${color}26, ${color}10)`, color }}>
          <Icon size={20} strokeWidth={2.2} />
        </span>
        {change !== undefined && change !== null && (
          <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-bold", up ? "bg-coral/10 text-[#E0594B]" : "bg-mint/10 text-[#1E9E80]")}>
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="label mt-5">{label}</p>
      <AnimatedNumber value={value} format={format} className="num mt-1.5 block font-display text-[28px] font-semibold leading-none text-ink" />
      {caption && <p className="mt-2 text-xs text-ink-muted">{caption}</p>}
      {spark && spark.length > 1 && (
        <div className="pointer-events-none absolute bottom-0 right-0 h-14 w-[55%] opacity-80">
          <Sparkline values={spark} color={color} id={label.replace(/\W/g, "")} />
        </div>
      )}
    </Card>
  );
}
