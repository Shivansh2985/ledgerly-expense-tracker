"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, CalendarDays, ChevronLeft, ChevronRight, Crown, Flame, Receipt, Target, Wallet } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { EmptyState, Skeleton } from "@/components/ui/Skeleton";
import { CategoryIcon, ModeIcon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { TimelineChart } from "@/components/charts/TimelineChart";
import { CategoryDonut } from "@/components/charts/CategoryDonut";
import { ModeBreakdown } from "@/components/charts/ModeBreakdown";
import { WeekdayChart } from "@/components/charts/WeekdayChart";
import { CategoryTrendChart } from "@/components/charts/CategoryTrendChart";
import { Heatmap } from "@/components/charts/Heatmap";
import { TopNotes } from "@/components/charts/TopNotes";
import { useApi } from "@/lib/client/api";
import type { AnalyticsResponse, Period } from "@/lib/types";
import { categoryMeta, modeMeta } from "@/lib/constants";
import { fmtDate, money, shiftDay, shiftMonth, toDay } from "@/lib/client/format";

const COPY: Record<Period, { cur: string; prev: string; unit: string }> = {
  daily: { cur: "Last 14 days", prev: "Prior 14 days", unit: "day" },
  monthly: { cur: "This month", prev: "Previous month", unit: "month" },
  yearly: { cur: "This year", prev: "Previous year", unit: "year" },
};

export default function AnalyticsPage() {
  const today = toDay();
  const [period, setPeriod] = useState<Period>("monthly");
  const [anchor, setAnchor] = useState(today);
  const { data, loading } = useApi<AnalyticsResponse>(`/api/analytics?period=${period}&date=${anchor}`);

  const move = (dir: 1 | -1) => {
    const next = period === "daily" ? shiftDay(anchor, dir) : period === "monthly" ? shiftMonth(anchor, dir) : shiftMonth(anchor, dir * 12);
    setAnchor(next > today ? today : next);
  };
  const atEnd = period === "daily" ? anchor >= today : period === "monthly" ? anchor.slice(0, 7) >= today.slice(0, 7) : anchor.slice(0, 4) >= today.slice(0, 4);
  const title =
    period === "daily" ? fmtDate(anchor, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : period === "monthly" ? fmtDate(anchor, { month: "long", year: "numeric" }) : anchor.slice(0, 4);
  const c = COPY[period];
  const s = data?.summary;
  const key = period + anchor;

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        subtitle="Explore your spending across days, months and years."
        right={
          <Segmented<Period>
            value={period}
            onChange={(p) => setPeriod(p)}
            options={[{ value: "daily", label: "Daily" }, { value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]}
          />
        }
      />

      <div className="neu mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl px-5 py-4">
        <div className="flex items-center gap-3">
          <IconButton onClick={() => move(-1)} aria-label="Previous"><ChevronLeft size={18} /></IconButton>
          <AnimatePresence mode="wait">
            <motion.div key={title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="min-w-[180px] text-center">
              <p className="font-display text-lg font-semibold text-ink">{title}</p>
              {data && <p className="text-xs text-ink-muted">{fmtDate(data.range.from)} – {fmtDate(data.range.to)}</p>}
            </motion.div>
          </AnimatePresence>
          <IconButton onClick={() => move(1)} disabled={atEnd} aria-label="Next" className="disabled:opacity-40"><ChevronRight size={18} /></IconButton>
        </div>
        <div className="flex items-center gap-3">
          <label className="neu-inset flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-ink-soft">
            <CalendarDays size={16} className="text-brand-500" />
            <input type="date" value={anchor} max={today} onChange={(e) => e.target.value && setAnchor(e.target.value)} className="bg-transparent outline-none" />
          </label>
          {anchor !== today && <button onClick={() => setAnchor(today)} className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-brand-600 hover:bg-white/60">Today</button>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4" key={"stats" + key}>
        {!s ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[168px] rounded-3xl" />)
        ) : (
          <>
            <StatCard label={`Total this ${c.unit}`} value={s.total} format={(n) => money(n)} icon={Wallet} color="#6C5CE7" change={s.changePct} caption={`Previous ${c.unit}: ${money(s.previousTotal)}`} spark={data!.timeline.map((t) => t.total)} />
            <StatCard label={period === "yearly" ? "Avg per month" : period === "daily" ? "Avg per day (14d)" : "Avg per day"} value={period === "yearly" ? s.avgPerMonth ?? 0 : s.avgPerDay} format={(n) => money(n)} icon={Target} color="#2EC4A0" caption={period === "yearly" ? `${money(s.avgPerDay)} per day` : `${s.activeDays} active day${s.activeDays === 1 ? "" : "s"}`} delay={0.06} />
            <StatCard label="Transactions" value={s.count} format={(n) => Math.round(n).toLocaleString("en-IN")} icon={Receipt} color="#FF7A6B" caption={`${money(s.avgPerTransaction)} average each`} delay={0.12} />
            <StatCard label="Biggest spend" value={s.highest?.amount ?? 0} format={(n) => money(n)} icon={Crown} color="#FFB547" caption={s.highest ? `${s.highest.note} · ${fmtDate(s.highest.date, { day: "numeric", month: "short" })}` : "No spends yet"} delay={0.18} />
          </>
        )}
      </div>

      {data && !loading && data.summary.count === 0 && period !== "daily" ? (
        <Card className="mt-5"><EmptyState icon={<Activity size={22} />} title="No expenses in this period" text="Pick another date or add some expenses to unlock insights." /></Card>
      ) : (
        <div key={key}>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1.75fr_1fr]">
            <Card delay={0.05}>
              <CardHeader title="Spending trend" subtitle={`${c.cur} compared with ${c.prev.toLowerCase()}`} />
              {data ? <TimelineChart timeline={data.timeline} previous={data.previousTimeline} currentLabel={c.cur} previousLabel={c.prev} height={310} tooltipLabel={(p) => (period === "yearly" ? fmtDate(p.date, { month: "long", year: "numeric" }) : fmtDate(p.date, { weekday: "short", day: "numeric", month: "short" }))} /> : <Skeleton className="h-[310px]" />}
            </Card>
            <Card delay={0.1}>
              <CardHeader title="Category split" subtitle={period === "daily" ? "For the selected day" : `For this ${c.unit}`} />
              {data ? data.byCategory.length ? <CategoryDonut data={data.byCategory} height={200} /> : <EmptyState title="Nothing spent" text="No expenses on this day." /> : <Skeleton className="h-[380px]" />}
            </Card>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <Card delay={0.15}>
              <CardHeader title="Category trend" subtitle="Your top 5 categories over time" />
              {data ? <CategoryTrendChart data={data.categoryTrend} height={300} /> : <Skeleton className="h-[300px]" />}
            </Card>
            <Card delay={0.2}>
              <CardHeader title="Payment modes" subtitle="Share of spend by how you paid" />
              {data ? data.byMode.length ? <ModeBreakdown data={data.byMode} variant="radial" /> : <EmptyState title="No data" /> : <Skeleton className="h-[230px]" />}
            </Card>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr]">
            <Card delay={0.25}>
              <CardHeader title="Weekday rhythm" subtitle="Average spend per weekday" />
              {data ? <WeekdayChart data={data.weekday} /> : <Skeleton className="h-[220px]" />}
              {data && <WeekdayInsight data={data.weekday} />}
            </Card>
            <Card delay={0.3}>
              <CardHeader title="Where your money goes" subtitle="Most common things you pay for" />
              {data ? data.topNotes.length ? <TopNotes data={data.topNotes} /> : <EmptyState title="No data" /> : <Skeleton className="h-[300px]" />}
            </Card>
            <Card delay={0.35} variant="neu">
              <CardHeader title="Highlights" subtitle="Quick reads on this period" />
              {data ? <Highlights data={data} unit={c.unit} /> : <Skeleton className="h-[300px]" />}
            </Card>
          </div>

          <Card delay={0.4} className="mt-5">
            <CardHeader title="Spending calendar" subtitle={period === "yearly" ? "Every day of the year" : period === "monthly" ? "Every day of the month" : "Last 15 weeks"} right={<Flame size={18} className="text-coral" />} />
            {data ? <Heatmap data={data.heatmap} /> : <Skeleton className="h-[150px]" />}
          </Card>
        </div>
      )}
    </>
  );
}

const FULL_DAY: Record<string, string> = { Mon: "Mondays", Tue: "Tuesdays", Wed: "Wednesdays", Thu: "Thursdays", Fri: "Fridays", Sat: "Saturdays", Sun: "Sundays" };

function WeekdayInsight({ data }: { data: AnalyticsResponse["weekday"] }) {
  const top = [...data].sort((a, b) => b.avg - a.avg)[0];
  const low = [...data].filter((d) => d.avg > 0).sort((a, b) => a.avg - b.avg)[0];
  if (!top || top.avg === 0) return null;
  return (
    <p className="mt-4 rounded-2xl bg-white/50 px-4 py-3 text-[13px] text-ink-soft">
      You spend the most on <b className="text-ink">{FULL_DAY[top.day] ?? top.day}</b> ({money(top.avg)} avg){low && low.day !== top.day ? <> and the least on <b className="text-ink">{FULL_DAY[low.day] ?? low.day}</b>.</> : "."}
    </p>
  );
}

function Highlights({ data, unit }: { data: AnalyticsResponse; unit: string }) {
  const s = data.summary;
  const cat = data.byCategory[0];
  const mode = data.byMode[0];
  const busiest = [...data.timeline].sort((a, b) => b.total - a.total)[0];
  const items = [
    cat && { icon: <CategoryIcon category={cat.key} size={38} />, title: `${categoryMeta(cat.key).label} leads`, text: `${cat.pct}% of spend · ${money(cat.total)}` },
    mode && { icon: <ModeIcon mode={mode.key} size={38} />, title: `Mostly via ${modeMeta(mode.key).label}`, text: `${mode.count} payments · ${mode.pct}% of spend` },
    busiest && busiest.total > 0 && { icon: <span className="flex h-[38px] w-[38px] items-center justify-center rounded-2xl bg-coral/10 text-coral"><Flame size={18} /></span>, title: `Peak: ${data.period === "yearly" ? fmtDate(busiest.date, { month: "long" }) : fmtDate(busiest.date, { day: "numeric", month: "short" })}`, text: `${money(busiest.total)} across ${busiest.count} spends` },
    s.changePct !== null && { icon: <span className={"flex h-[38px] w-[38px] items-center justify-center rounded-2xl text-xs font-bold " + (s.changePct > 0 ? "bg-coral/10 text-coral" : "bg-mint/10 text-mint")}>{s.changePct > 0 ? "▲" : "▼"}</span>, title: s.changePct > 0 ? `Up ${s.changePct}% vs last ${unit}` : `Down ${Math.abs(s.changePct)}% vs last ${unit}`, text: `${money(Math.abs(s.total - s.previousTotal))} ${s.changePct > 0 ? "more" : "less"} than before` },
  ].filter(Boolean) as { icon: React.ReactNode; title: string; text: string }[];
  if (!items.length) return <EmptyState title="Not enough data" />;
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <motion.div key={it.title} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }} className="glass flex items-center gap-3 rounded-2xl p-3">
          {it.icon}
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold text-ink">{it.title}</p>
            <p className="text-xs text-ink-muted">{it.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
