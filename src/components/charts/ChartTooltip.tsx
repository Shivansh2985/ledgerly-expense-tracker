"use client";
import { money } from "@/lib/client/format";

type Item = { name?: string | number; value?: number | string; color?: string; dataKey?: string | number; payload?: Record<string, unknown> };

export function ChartTooltip({ active, payload, label, labelFormatter }: { active?: boolean; payload?: Item[]; label?: string | number; labelFormatter?: (l: string | number, p?: Item[]) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong min-w-[150px] rounded-2xl px-4 py-3 text-xs">
      <p className="mb-2 font-semibold text-ink">{labelFormatter ? labelFormatter(label ?? "", payload) : label}</p>
      <div className="space-y-1.5">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-ink-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="num font-semibold text-ink">{money(Number(p.value))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
