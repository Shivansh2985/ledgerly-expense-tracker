"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { EmptyState, Skeleton } from "@/components/ui/Skeleton";
import { CategoryIcon, ModeBadge } from "@/components/ui/Icon";
import { PageHeader } from "@/components/layout/PageHeader";
import { CategoryDonut } from "@/components/charts/CategoryDonut";
import { useToast } from "@/components/ui/Toast";
import { useApi } from "@/lib/client/api";
import type { StatementResponse } from "@/lib/types";
import { categoryMeta } from "@/lib/constants";
import { fmtDate, fromDay, money, shiftDay, shiftMonth, toDay } from "@/lib/client/format";
import { cn } from "@/lib/client/cn";

function presets(today: string) {
  const firstThis = today.slice(0, 8) + "01";
  const firstLast = shiftMonth(firstThis, -1);
  const lastOfLast = shiftDay(firstThis, -1);
  return [
    { id: "this-month", label: "This month", from: firstThis, to: today },
    { id: "last-month", label: "Last month", from: firstLast, to: lastOfLast },
    { id: "3m", label: "Last 3 months", from: shiftMonth(firstThis, -2), to: today },
    { id: "6m", label: "Last 6 months", from: shiftMonth(firstThis, -5), to: today },
    { id: "ytd", label: "This year", from: today.slice(0, 4) + "-01-01", to: today },
    { id: "last-year", label: "Last year", from: `${Number(today.slice(0, 4)) - 1}-01-01`, to: `${Number(today.slice(0, 4)) - 1}-12-31` },
  ];
}

export default function StatementsPage() {
  const today = toDay();
  const ps = useMemo(() => presets(today), [today]);
  const [preset, setPreset] = useState<string>("this-month");
  const [range, setRange] = useState({ from: ps[0].from, to: ps[0].to });
  const { data, loading } = useApi<StatementResponse>(`/api/statements?from=${range.from}&to=${range.to}`);
  const toast = useToast();
  const [busy, setBusy] = useState<"pdf" | "csv" | null>(null);

  const fileBase = `Ledgerly-Statement_${range.from}_to_${range.to}`;

  async function downloadPdf() {
    if (!data) return;
    setBusy("pdf");
    try {
      const { generateStatementPdf } = await import("@/lib/statement");
      const doc = await generateStatementPdf(data);
      doc.save(fileBase + ".pdf");
      toast("PDF statement downloaded");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(null);
    }
  }

  async function downloadCsv() {
    if (!data) return;
    setBusy("csv");
    const { statementToCsv } = await import("@/lib/statement");
    const blob = new Blob([statementToCsv(data)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileBase + ".csv";
    a.click();
    URL.revokeObjectURL(a.href);
    setBusy(null);
    toast("CSV statement downloaded");
  }

  const days = Math.round((fromDay(range.to).getTime() - fromDay(range.from).getTime()) / 86400000) + 1;

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Statements"
        subtitle="Generate a polished statement for any date range."
        right={
          <div className="no-print flex flex-wrap gap-3">
            <Button variant="neu" onClick={() => window.print()} disabled={!data?.items.length}><Printer size={16} /> Print</Button>
            <Button variant="neu" onClick={downloadCsv} loading={busy === "csv"} disabled={!data?.items.length}><FileSpreadsheet size={16} /> CSV</Button>
            <Button onClick={downloadPdf} loading={busy === "pdf"} disabled={!data?.items.length}><Download size={16} /> Download PDF</Button>
          </div>
        }
      />

      <Card variant="neu" className="no-print mb-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
          <div className="flex-1">
            <p className="label mb-3">Quick ranges</p>
            <div className="flex flex-wrap gap-2">
              {ps.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPreset(p.id); setRange({ from: p.from, to: p.to }); }}
                  className={cn("rounded-2xl px-4 py-2.5 text-sm font-semibold transition", preset === p.id ? "bg-white text-brand-600 shadow-[0_6px_16px_-6px_rgba(108,92,231,0.4)] ring-1 ring-brand-200" : "text-ink-muted shadow-neu-sm hover:text-ink")}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div>
              <p className="label mb-2">From</p>
              <Input type="date" icon={<CalendarDays size={16} />} value={range.from} max={range.to} onChange={(e) => { setPreset("custom"); if (e.target.value) setRange({ ...range, from: e.target.value }); }} className="py-2.5 text-sm" />
            </div>
            <div>
              <p className="label mb-2">To</p>
              <Input type="date" icon={<CalendarDays size={16} />} value={range.to} min={range.from} max={today} onChange={(e) => { setPreset("custom"); if (e.target.value) setRange({ ...range, to: e.target.value }); }} className="py-2.5 text-sm" />
            </div>
          </div>
        </div>
      </Card>

      <motion.div key={range.from + range.to} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glass-strong overflow-hidden rounded-[2rem]">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#7B6CF0,#6C5CE7_50%,#4636AE)] px-8 py-8 text-white">
          <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 right-40 h-32 w-32 rounded-full bg-[#FF7A6B]/30 blur-2xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/70"><FileText size={14} /> Expense statement</p>
              <p className="mt-2 font-display text-2xl font-semibold">{data?.user.name ?? "—"}</p>
              <p className="text-sm text-white/70">{data?.user.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Statement period</p>
              <p className="mt-2 font-display text-lg font-semibold">{fmtDate(range.from)} – {fmtDate(range.to)}</p>
              <p className="text-sm text-white/70">{days} days</p>
            </div>
          </div>
          <div className="relative mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { l: "Total spent", v: data ? money(data.totals.total, true) : "—" },
              { l: "Transactions", v: data ? String(data.totals.count) : "—" },
              { l: "Average / day", v: data ? money(data.totals.avgPerDay, true) : "—" },
              { l: "Top category", v: data?.byCategory[0] ? categoryMeta(data.byCategory[0].key).label : "—" },
            ].map((x) => (
              <div key={x.l} className="rounded-2xl bg-white/12 px-4 py-3 ring-1 ring-inset ring-white/20 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">{x.l}</p>
                <p className="num mt-1 font-display text-lg font-semibold">{x.v}</p>
              </div>
            ))}
          </div>
        </div>

        {loading && !data ? (
          <div className="space-y-3 p-8">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : !data?.items.length ? (
          <EmptyState icon={<FileText size={22} />} title="No transactions in this range" text="Choose a different period to generate a statement." />
        ) : (
          <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1fr_320px]">
            <div className="min-w-0 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-faint/30 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Description</th>
                    <th className="pb-3 pr-4">Mode</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((e, i) => (
                    <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.012, 0.6) }} className="border-b border-ink-faint/15 last:border-0 hover:bg-white/50">
                      <td className="whitespace-nowrap py-3 pr-4 text-ink-muted">{fmtDate(e.date, { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <CategoryIcon category={e.category} size={30} />
                          <div>
                            <p className="font-semibold text-ink">{e.note}</p>
                            <p className="text-xs text-ink-muted">{categoryMeta(e.category).label}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4"><ModeBadge mode={e.paymentMode} /></td>
                      <td className="num py-3 text-right font-semibold text-ink">{money(e.amount, true)}</td>
                    </motion.tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="pt-4 text-right text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">Total</td>
                    <td className="num pt-4 text-right font-display text-lg font-semibold text-ink">{money(data.totals.total, true)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="space-y-6">
              <div className="neu p-5">
                <CardHeader title="By category" className="mb-3" />
                <CategoryDonut data={data.byCategory} height={180} />
              </div>
              <div className="neu p-5">
                <CardHeader title="By payment mode" className="mb-3" />
                <div className="space-y-2.5">
                  {data.byMode.map((m) => (
                    <div key={m.key} className="flex items-center justify-between text-sm">
                      <ModeBadge mode={m.key} />
                      <span className="num font-semibold text-ink">{money(m.total)} <span className="text-xs text-ink-muted">· {m.pct}%</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
