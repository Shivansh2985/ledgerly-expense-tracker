"use client";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

export function WeekdayChart({ data, height = 220 }: { data: { day: string; total: number; avg: number; count: number }[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.avg), 0);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="wd-hi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF9A8B" />
            <stop offset="100%" stopColor="#FF7A6B" />
          </linearGradient>
          <linearGradient id="wd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A99CF6" />
            <stop offset="100%" stopColor="#6C5CE7" />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" tickLine={false} axisLine={false} dy={6} />
        <Tooltip cursor={{ fill: "rgba(108,92,231,0.06)", radius: 12 }} content={(p) => <ChartTooltip {...(p as object)} />} />
        <Bar dataKey="avg" name="Avg spend" radius={[10, 10, 10, 10]} barSize={26} animationDuration={1200} background={{ fill: "#E3E6F0", radius: 10 }}>
          {data.map((d) => (
            <Cell key={d.day} fill={d.avg === max && max > 0 ? "url(#wd-hi)" : "url(#wd)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
