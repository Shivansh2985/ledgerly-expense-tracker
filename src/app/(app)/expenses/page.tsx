"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { EmptyState, Skeleton } from "@/components/ui/Skeleton";
import { Segmented } from "@/components/ui/Segmented";
import { PageHeader } from "@/components/layout/PageHeader";
import { useApp } from "@/components/layout/AppProviders";
import { ExpenseRow } from "@/components/expenses/ExpenseRow";
import { useApi } from "@/lib/client/api";
import type { ExpenseDTO, ExpenseListResponse } from "@/lib/types";
import { CATEGORIES, PAYMENT_MODES } from "@/lib/constants";
import { money, relativeDay, shiftDay, shiftMonth, toDay } from "@/lib/client/format";

type Range = "7d" | "30d" | "month" | "all" | "custom";
const LIMIT = 50;

export default function ExpensesPage() {
  const { openAdd } = useApp();
  const today = toDay();
  const [range, setRange] = useState<Range>("30d");
  const [custom, setCustom] = useState({ from: shiftMonth(today, -1), to: today });
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => setPage(1), [range, custom, category, mode, debouncedQ, sort]);

  const { from, to } = useMemo(() => {
    if (range === "7d") return { from: shiftDay(today, -6), to: today };
    if (range === "30d") return { from: shiftDay(today, -29), to: today };
    if (range === "month") return { from: today.slice(0, 8) + "01", to: today };
    if (range === "custom") return custom;
    return { from: "", to: "" };
  }, [range, custom, today]);

  const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), sort });
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (category) params.set("category", category);
  if (mode) params.set("mode", mode);
  if (debouncedQ) params.set("q", debouncedQ);
  const { data, loading } = useApi<ExpenseListResponse>("/api/expenses?" + params.toString());

  const groups = useMemo(() => {
    if (!data) return [];
    if (!sort.startsWith("date")) return [{ date: "", items: data.items, total: data.items.reduce((s, e) => s + e.amount, 0) }];
    const map = new Map<string, ExpenseDTO[]>();
    data.items.forEach((e) => map.set(e.date, [...(map.get(e.date) ?? []), e]));
    return Array.from(map, ([date, items]) => ({ date, items, total: items.reduce((s, e) => s + e.amount, 0) }));
  }, [data, sort]);

  const pages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;
  const hasFilters = category || mode || q;

  return (
    <>
      <PageHeader eyebrow="Ledger" title="Expenses" subtitle="Every transaction, searchable and grouped by day." right={<Button onClick={() => openAdd()}><Plus size={17} strokeWidth={2.6} /> Add expense</Button>} />

      <Card className="mb-5" variant="neu">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <Segmented<Range>
            value={range}
            onChange={setRange}
            size="sm"
            options={[{ value: "7d", label: "7 days" }, { value: "30d", label: "30 days" }, { value: "month", label: "This month" }, { value: "all", label: "All time" }, { value: "custom", label: "Custom" }]}
          />
          <AnimatePresence>
            {range === "custom" && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="flex items-center gap-2 overflow-hidden">
                <Input type="date" value={custom.from} max={custom.to} onChange={(e) => setCustom({ ...custom, from: e.target.value })} className="py-2.5 text-sm" />
                <span className="text-ink-muted">→</span>
                <Input type="date" value={custom.to} min={custom.from} max={today} onChange={(e) => setCustom({ ...custom, to: e.target.value })} className="py-2.5 text-sm" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="col-span-2 md:col-span-1">
              <Input icon={<Search size={16} />} placeholder="Search notes…" value={q} onChange={(e) => setQ(e.target.value)} className="py-2.5 text-sm" />
            </div>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} className="py-2.5 text-sm">
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </Select>
            <Select value={mode} onChange={(e) => setMode(e.target.value)} className="py-2.5 text-sm">
              <option value="">All modes</option>
              {PAYMENT_MODES.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="py-2.5 text-sm">
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
              <option value="amount_desc">Highest amount</option>
              <option value="amount_asc">Lowest amount</option>
            </Select>
          </div>
        </div>
      </Card>

      <div className="mb-5 grid gap-5 sm:grid-cols-3">
        <Summary label="Total in view" value={data ? money(data.sum) : "—"} accent="#6C5CE7" />
        <Summary label="Transactions" value={data ? String(data.total) : "—"} accent="#FF7A6B" />
        <Summary label="Average spend" value={data && data.total ? money(data.sum / data.total) : "—"} accent="#2EC4A0" />
      </div>

      <Card>
        {hasFilters && (
          <button onClick={() => { setCategory(""); setMode(""); setQ(""); }} className="mb-3 inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
            <X size={12} /> Clear filters
          </button>
        )}
        {!data && loading ? (
          <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : !data?.items.length ? (
          <EmptyState icon={<Search size={22} />} title="No expenses found" text="Try a different range or filters, or add a new expense." action={<Button onClick={() => openAdd()}>Add expense</Button>} />
        ) : (
          <div className="space-y-6">
            {groups.map((g) => (
              <div key={g.date || "all"}>
                {g.date && (
                  <div className="mb-1 flex items-center justify-between px-3">
                    <p className="font-display text-sm font-semibold text-ink">{relativeDay(g.date)}</p>
                    <p className="num text-xs font-semibold text-ink-muted">{g.items.length} · {money(g.total)}</p>
                  </div>
                )}
                <div className="-mx-3">
                  <AnimatePresence initial={false}>
                    {g.items.map((e, i) => <ExpenseRow key={e.id} e={e} i={i} showDate={!g.date} />)}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
        {pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="neu" className="px-3 py-2" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /></Button>
            <span className="text-sm font-semibold text-ink-soft">Page {page} of {pages}</span>
            <Button variant="neu" className="px-3 py-2" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={16} /></Button>
          </div>
        )}
      </Card>
    </>
  );
}

function Summary({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="glass flex items-center gap-4 p-5">
      <span className="h-10 w-1.5 rounded-full" style={{ background: accent }} />
      <div>
        <p className="label">{label}</p>
        <p className="num mt-1 font-display text-xl font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}
