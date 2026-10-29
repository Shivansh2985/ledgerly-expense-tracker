"use client";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { fmtDate, fromDay, money } from "@/lib/client/format";

const LEVELS = ["#E2E5EF", "#D9D3FB", "#B5A9F7", "#8B7BF0", "#6C5CE7", "#4636AE"];

/** GitHub-style calendar heatmap; columns are weeks (Mon-first). */
export function Heatmap({ data }: { data: { date: string; total: number }[] }) {
  const [hover, setHover] = useState<{ date: string; total: number } | null>(null);
  const { weeks, max, months } = useMemo(() => {
    if (!data.length) return { weeks: [] as ({ date: string; total: number } | null)[][], max: 0, months: [] as { i: number; label: string }[] };
    const first = fromDay(data[0].date);
    const pad = (first.getDay() + 6) % 7;
    const cells: ({ date: string; total: number } | null)[] = [...Array(pad).fill(null), ...data];
    const weeks: ({ date: string; total: number } | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    const max = Math.max(...data.map((d) => d.total), 0);
    const months: { i: number; label: string }[] = [];
    let last = -1;
    weeks.forEach((w, i) => {
      const c = w.find(Boolean);
      if (!c) return;
      const m = fromDay(c.date).getMonth();
      if (m !== last) {
        months.push({ i, label: fromDay(c.date).toLocaleDateString("en-IN", { month: "short" }) });
        last = m;
      }
    });
    return { weeks, max, months };
  }, [data]);

  const level = (v: number) => (v <= 0 || max === 0 ? 0 : Math.min(5, Math.ceil((Math.sqrt(v) / Math.sqrt(max)) * 5)));

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          <div className="relative ml-8 h-5 text-[10.5px] font-semibold text-ink-muted">
            {months.map((m) => (
              <span key={m.i + m.label} className="absolute" style={{ left: m.i * 17 }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            <div className="mr-1 flex w-7 flex-col gap-[3px] text-[10px] font-medium text-ink-faint">
              {["Mon", "", "Wed", "", "Fri", "", "Sun"].map((d, i) => (
                <span key={i} className="h-[14px] leading-[14px]">{d}</span>
              ))}
            </div>
            {weeks.map((w, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, di) => {
                  const c = w[di];
                  if (!c) return <span key={di} className="h-[14px] w-[14px]" />;
                  return (
                    <motion.span
                      key={di}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(wi * 0.012, 0.8), duration: 0.3 }}
                      onMouseEnter={() => setHover(c)}
                      onMouseLeave={() => setHover(null)}
                      className="h-[14px] w-[14px] cursor-pointer rounded-[4px] transition-transform hover:scale-125"
                      style={{ background: LEVELS[level(c.total)], boxShadow: level(c.total) > 3 ? "0 2px 6px -1px rgba(108,92,231,0.5)" : undefined }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="h-5 font-semibold text-ink-soft">{hover ? `${fmtDate(hover.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · ${money(hover.total)}` : "Hover a day to see spend"}</span>
        <span className="flex items-center gap-1.5 text-ink-muted">
          Less {LEVELS.map((c) => <span key={c} className="h-3 w-3 rounded-[3px]" style={{ background: c }} />)} More
        </span>
      </div>
    </div>
  );
}
