"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { Breakdown } from "@/lib/types";
import { categoryMeta, modeMeta } from "@/lib/constants";
import { money } from "@/lib/client/format";

type Props = { data: Breakdown<string>[]; kind?: "category" | "mode"; height?: number; showList?: boolean };

export function CategoryDonut({ data, kind = "category", height = 230, showList = true }: Props) {
  const [active, setActive] = useState<number | undefined>(undefined);
  const meta = kind === "category" ? categoryMeta : modeMeta;
  const total = data.reduce((s, d) => s + d.total, 0);
  const focus = active !== undefined ? data[active] : undefined;

  return (
    <div className="flex flex-col gap-5">
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="key"
              innerRadius="68%"
              outerRadius="92%"
              paddingAngle={2.5}
              cornerRadius={8}
              stroke="none"
              onMouseEnter={(_, i) => setActive(i)}
              onMouseLeave={() => setActive(undefined)}
              animationDuration={1300}
              animationEasing="ease-out"
            >
              {data.map((d) => (
                <Cell key={d.key} fill={meta(d.key).color} opacity={active === undefined || data[active]?.key === d.key ? 1 : 0.35} style={{ transition: "opacity .25s" }} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="label">{focus ? meta(focus.key).label : "Total"}</p>
          <p className="num mt-1 font-display text-2xl font-semibold text-ink">{money(focus ? focus.total : total)}</p>
          {focus && <p className="text-xs font-semibold" style={{ color: meta(focus.key).color }}>{focus.pct}%</p>}
        </div>
      </div>
      {showList && (
        <div className="space-y-3">
          {data.slice(0, 6).map((d, i) => (
            <div key={d.key} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(undefined)} className="group cursor-default">
              <div className="mb-1.5 flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 font-semibold text-ink-soft group-hover:text-ink">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta(d.key).color }} />
                  {meta(d.key).label}
                </span>
                <span className="num font-semibold text-ink">
                  {money(d.total)} <span className="ml-1 text-ink-muted">{d.pct}%</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#DDE1EC] shadow-neu-inset-sm">
                <motion.div className="h-full rounded-full" style={{ background: meta(d.key).color }} initial={{ width: 0 }} animate={{ width: d.pct + "%" }} transition={{ duration: 1.1, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
