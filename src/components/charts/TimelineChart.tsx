"use client";
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TimelinePoint } from "@/lib/types";
import { moneyCompact, toDay } from "@/lib/client/format";
import { ChartTooltip } from "./ChartTooltip";

export function TimelineChart({ timeline, previous, height = 280, currentLabel = "This period", previousLabel = "Previous period", tooltipLabel }: { timeline: TimelinePoint[]; previous?: TimelinePoint[]; height?: number; currentLabel?: string; previousLabel?: string; tooltipLabel?: (p: TimelinePoint) => string }) {
  const today = toDay();
  const data = timeline.map((t, i) => ({ ...t, total: t.date > today ? null : t.total, previous: previous?.[i]?.total ?? null }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="tl-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6C5CE7" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="tl-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8B7BF0" />
            <stop offset="60%" stopColor="#6C5CE7" />
            <stop offset="100%" stopColor="#FF7A6B" />
          </linearGradient>
          <filter id="tl-glow" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#6C5CE7" floodOpacity="0.35" />
          </filter>
        </defs>
        <CartesianGrid vertical={false} stroke="#D6DAE6" strokeDasharray="4 6" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={14} dy={8} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => moneyCompact(Number(v))} width={56} />
        <Tooltip
          cursor={{ stroke: "#6C5CE7", strokeOpacity: 0.25, strokeWidth: 30 }}
          content={(p) => <ChartTooltip {...(p as object)} labelFormatter={(l, pl) => (tooltipLabel && pl?.[0]?.payload ? tooltipLabel(pl[0].payload as unknown as TimelinePoint) : String(l))} />}
        />
        {previous && <Line type="monotone" dataKey="previous" name={previousLabel} stroke="#B9BED3" strokeWidth={2} strokeDasharray="5 5" dot={false} animationDuration={1400} />}
        <Area type="monotone" dataKey="total" name={currentLabel} stroke="url(#tl-stroke)" strokeWidth={3} fill="url(#tl-fill)" filter="url(#tl-glow)" activeDot={{ r: 6, stroke: "#fff", strokeWidth: 3, fill: "#6C5CE7" }} animationDuration={1400} animationEasing="ease-out" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
