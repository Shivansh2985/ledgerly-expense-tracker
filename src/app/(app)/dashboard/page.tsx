"use client";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, CalendarDays, Flame, Plus, Receipt, Target, Wallet } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { useApp } from "@/components/layout/AppProviders";
import { StatCard } from "@/components/dashboard/StatCard";
import { TimelineChart } from "@/components/charts/TimelineChart";
import { CategoryDonut } from "@/components/charts/CategoryDonut";
import { ModeBreakdown } from "@/components/charts/ModeBreakdown";
import { TopNotes } from "@/components/charts/TopNotes";
import { ExpenseRow } from "@/components/expenses/ExpenseRow";
import { useApi } from "@/lib/client/api";
import type { AnalyticsResponse, ExpenseListResponse } from "@/lib/types";
import { categoryMeta } from "@/lib/constants";
import { fmtDate, greeting, money, toDay } from "@/lib/client/format";

export default function Dashboard() {
  const { user, openAdd } = useApp();
  const today = toDay();
  const month = useApi<AnalyticsResponse>(`/api/analytics?period=monthly&date=${today}`);
  const day = useApi<AnalyticsResponse>(`/api/analytics?period=daily&date=${today}`);
  const recent = useApi<ExpenseListResponse>("/api/expenses?limit=7&sort=date_desc");
  const m = month.data;
  const d = day.data;
  const monthLabel = fmtDate(today, { month: "long", year: "numeric" });
  const spark = useMemo(() => d?.timeline.map((t) => t.total) ?? [], [d]);
  const cumSpark = useMemo(() => {
    let acc = 0;
    return m?.timeline.filter((t) => t.date <= today).map((t) => (acc += t.total)) ?? [];
  }, [m, today]);
  const topCat = m?.byCategory[0];

  return (
    <>
      <PageHeader
        eyebrow={fmtDate(today, { weekday: "long", day: "numeric", month: "long" })}
        title={<>{greeting()}, <span className="font-serif text-[1.1em] font-normal italic text-gradient">{user?.name?.split(" ")[0] ?? "there"}</span></>}
        subtitle={`Here’s how your money moved in ${monthLabel}.`}
        right={
          <>
            <Link href="/analytics"><Button variant="neu">View analytics</Button></Link>
            <Button onClick={() => openAdd()}><Plus size={17} strokeWidth={2.6} /> Add expense</Button>
          </>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {!m || !d ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[168px] rounded-3xl" />)
        ) : (
          <>
            <StatCard label="Spent this month" value={m.summary.total} format={(n) => money(n)} icon={Wallet} color="#6C5CE7" change={m.summary.changePct} caption={`vs ${money(m.summary.previousTotal)} last month`} spark={cumSpark} delay={0} />
            <StatCard label="Spent today" value={d.summary.total} format={(n) => money(n)} icon={CalendarDays} color="#FF7A6B" change={d.summary.changePct} caption={`${d.summary.count} transactions today`} spark={spark} delay={0.06} />
            <StatCard label="Daily average" value={m.summary.avgPerDay} format={(n) => money(n)} icon={Target} color="#2EC4A0" caption={`Across ${m.summary.activeDays} active days`} delay={0.12} />
            <StatCard label="Avg per transaction" value={m.summary.avgPerTransaction} format={(n) => money(n)} icon={Receipt} color="#FFB547" caption={`${m.summary.count} transactions this month`} delay={0.18} />
          </>
        )}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.75fr_1fr]">
        <Card delay={0.1}>
          <CardHeader title="Spending flow" subtitle={`Daily spend in ${monthLabel} vs last month`} right={<Legend />} />
          {m ? <TimelineChart timeline={m.timeline} previous={m.previousTimeline} currentLabel="This month" previousLabel="Last month" height={300} tooltipLabel={(p) => fmtDate(p.date, { day: "numeric", month: "short" })} /> : <Skeleton className="h-[300px]" />}
        </Card>
        <Card delay={0.15}>
          <CardHeader title="Where it went" subtitle="Category split this month" />
          {m ? m.byCategory.length ? <CategoryDonut data={m.byCategory} height={210} /> : <EmptyState title="No spends yet" text="Add your first expense to see the split." /> : <Skeleton className="h-[380px]" />}
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr]">
        <Card delay={0.2}>
          <CardHeader
            title="Recent activity"
            subtitle="Your latest transactions"
            right={<Link href="/expenses" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">See all <ArrowRight size={13} /></Link>}
          />
          <div className="-mx-3">
            {recent.data ? recent.data.items.length ? recent.data.items.map((e, i) => <ExpenseRow key={e.id} e={e} i={i} showDate />) : <EmptyState title="Nothing logged yet" action={<Button onClick={() => openAdd()}>Add expense</Button>} /> : <Skeleton className="mx-3 h-[380px]" />}
          </div>
        </Card>
        <Card delay={0.25}>
          <CardHeader title="Top spending habits" subtitle="What you pay for most often" />
          {m ? m.topNotes.length ? <TopNotes data={m.topNotes.slice(0, 6)} /> : <EmptyState title="No habits yet" /> : <Skeleton className="h-[340px]" />}
        </Card>
        <div className="flex flex-col gap-5">
          <Card delay={0.3}>
            <CardHeader title="Payment modes" subtitle="How you paid this month" />
            {m ? m.byMode.length ? <ModeBreakdown data={m.byMode} /> : <EmptyState title="No data" /> : <Skeleton className="h-[220px]" />}
          </Card>
          {m?.summary.highest && topCat && (
            <Card variant="neu" delay={0.35} className="overflow-hidden">
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[radial-gradient(circle,#FFC9BE,transparent_70%)]" />
              <div className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-coral"><Flame size={15} /> Insight</div>
              <p className="relative mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                <b className="text-ink">{categoryMeta(topCat.key).label}</b> takes <b className="text-ink">{topCat.pct}%</b> of your spend this month. Your biggest single spend was <b className="text-ink">{money(m.summary.highest.amount)}</b> on “{m.summary.highest.note}”.
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Legend() {
  return (
    <div className="hidden items-center gap-4 text-xs font-semibold text-ink-muted sm:flex">
      <span className="flex items-center gap-1.5"><span className="h-2 w-5 rounded-full bg-[linear-gradient(90deg,#8B7BF0,#FF7A6B)]" /> This month</span>
      <span className="flex items-center gap-1.5"><span className="h-0 w-5 border-t-2 border-dashed border-ink-faint" /> Last month</span>
    </div>
  );
}
