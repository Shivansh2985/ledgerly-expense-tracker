"use client";
import { motion } from "framer-motion";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import type { Breakdown } from "@/lib/types";
import type { PaymentModeKey } from "@/lib/constants";
import { modeMeta } from "@/lib/constants";
import { iconFor } from "@/components/ui/Icon";
import { money } from "@/lib/client/format";

export function ModeBreakdown({ data, variant = "list" }: { data: Breakdown<PaymentModeKey>[]; variant?: "list" | "radial" }) {
  if (variant === "radial") {
    const rows = [...data].reverse().map((d) => ({ ...d, fill: modeMeta(d.key).color, name: modeMeta(d.key).label }));
    return (
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_1fr]">
        <div className="h-[230px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="28%" outerRadius="100%" data={rows} startAngle={90} endAngle={-270} barSize={11}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="pct" cornerRadius={10} background={{ fill: "#DFE3EE" }} animationDuration={1400} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <ModeList data={data} />
      </div>
    );
  }
  return <ModeList data={data} />;
}

function ModeList({ data }: { data: Breakdown<PaymentModeKey>[] }) {
  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const m = modeMeta(d.key);
        const I = iconFor(m.icon);
        return (
          <motion.div key={d.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: m.color + "18", color: m.color }}>
              <I size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold text-ink">{m.label}</span>
                <span className="num font-semibold text-ink">{money(d.total)}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#DDE1EC]">
                  <motion.div className="h-full rounded-full" style={{ background: m.color }} initial={{ width: 0 }} animate={{ width: d.pct + "%" }} transition={{ duration: 1, delay: 0.1 + i * 0.06 }} />
                </div>
                <span className="w-16 text-right text-[11px] font-medium text-ink-muted">{d.count} txns</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
