"use client";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalyticsResponse } from "@/lib/types";
import { categoryMeta } from "@/lib/constants";
import { moneyCompact } from "@/lib/client/format";
import { ChartTooltip } from "./ChartTooltip";

export function CategoryTrendChart({ data, height = 280 }: { data: AnalyticsResponse["categoryTrend"]; height?: number }) {
  const keys = Array.from(new Set(data.flatMap((d) => Object.keys(d.values))));
  const rows = data.map((d) => ({ label: d.label, ...Object.fromEntries(keys.map((k) => [k, d.values[k as keyof typeof d.values] ?? 0])) }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 10, right: 4, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#D6DAE6" strokeDasharray="4 6" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={10} dy={8} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => moneyCompact(Number(v))} width={56} />
        <Tooltip cursor={{ fill: "rgba(108,92,231,0.06)" }} content={(p) => <ChartTooltip {...(p as object)} />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 12 }} formatter={(v) => <span className="text-ink-soft">{v}</span>} />
        {keys.map((k, i) => (
          <Bar key={k} dataKey={k} name={categoryMeta(k).label} stackId="a" fill={categoryMeta(k).color} radius={i === keys.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]} animationDuration={1100} animationBegin={i * 120} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
