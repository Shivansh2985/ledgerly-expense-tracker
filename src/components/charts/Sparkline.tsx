"use client";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

export function Sparkline({ values, color = "#6C5CE7", id }: { values: number[]; color?: string; id: string }) {
  const data = values.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={"sp-" + id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#sp-${id})`} isAnimationActive animationDuration={1200} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
