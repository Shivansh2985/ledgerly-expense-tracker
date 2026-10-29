import Expense from "@/models/Expense";
import { connectDB } from "@/lib/db";
import { addDays, daysBetweenInclusive, formatDay, parseDay } from "@/lib/dates";
import { toExpenseDTO } from "@/lib/expense-dto";
import type { AnalyticsResponse, Breakdown, ExpenseDTO, Period, TimelinePoint } from "@/lib/types";
import type { CategoryKey } from "@/lib/constants";

const DAY_MS = 86_400_000;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function dateAt(day: string) {
  return parseDay(day);
}

function firstOfMonth(day: string) {
  const date = dateAt(day);
  return formatDay(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)));
}

function lastOfMonth(day: string) {
  const date = dateAt(day);
  return formatDay(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)));
}

function firstOfYear(year: number) {
  return `${year}-01-01`;
}

function lastOfYear(year: number) {
  return `${year}-12-31`;
}

function monthLabel(day: string) {
  return new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(dateAt(day));
}

function dayLabel(day: string) {
  return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", timeZone: "UTC" }).format(dateAt(day));
}

function pointLabel(day: string, period: Period): string {
  if (period === "daily") return dayLabel(day);
  if (period === "monthly") return String(dateAt(day).getUTCDate());
  return monthLabel(day);
}

function makePoint(day: string, label: string, entries: ExpenseDTO[]): TimelinePoint {
  return {
    label,
    date: day,
    total: roundMoney(entries.reduce((sum, item) => sum + item.amount, 0)),
    count: entries.length,
  };
}

function buildBreakdown<K extends string>(
  entries: ExpenseDTO[],
  selectKey: (entry: ExpenseDTO) => K,
): Breakdown<K>[] {
  const grouped = new Map<K, { total: number; count: number }>();
  for (const entry of entries) {
    const key = selectKey(entry);
    const current = grouped.get(key) ?? { total: 0, count: 0 };
    current.total += entry.amount;
    current.count += 1;
    grouped.set(key, current);
  }
  const total = entries.reduce((sum, item) => sum + item.amount, 0);
  return Array.from(grouped.entries())
    .map(([key, value]) => ({
      key,
      total: roundMoney(value.total),
      count: value.count,
      pct: total ? Math.round((value.total / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

function makeTopNotes(entries: ExpenseDTO[]) {
  const groups = new Map<
    string,
    { total: number; count: number; originals: Map<string, number>; categories: Map<CategoryKey, number> }
  >();
  for (const entry of entries) {
    const normalized = entry.note.trim().toLowerCase().replace(/\s+/g, " ");
    const group = groups.get(normalized) ?? {
      total: 0,
      count: 0,
      originals: new Map<string, number>(),
      categories: new Map<CategoryKey, number>(),
    };
    group.total += entry.amount;
    group.count += 1;
    group.originals.set(entry.note, (group.originals.get(entry.note) ?? 0) + 1);
    group.categories.set(entry.category, (group.categories.get(entry.category) ?? 0) + 1);
    groups.set(normalized, group);
  }
  return Array.from(groups.values())
    .map((group) => ({
      note: Array.from(group.originals.entries()).sort((a, b) => b[1] - a[1])[0][0],
      total: roundMoney(group.total),
      count: group.count,
      category: Array.from(group.categories.entries()).sort((a, b) => b[1] - a[1])[0][0],
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
}

function totalFor(entries: ExpenseDTO[], from: string, to: string) {
  return roundMoney(
    entries
      .filter((entry) => entry.date >= from && entry.date <= to)
      .reduce((sum, item) => sum + item.amount, 0),
  );
}

function makeDailyBuckets(from: string, count: number, entries: ExpenseDTO[], period: Period) {
  return Array.from({ length: count }, (_, index) => {
    const day = addDays(from, index);
    return makePoint(
      day,
      pointLabel(day, period),
      entries.filter((entry) => entry.date === day),
    );
  });
}

export function computeAnalytics(
  expenses: ExpenseDTO[],
  period: Period,
  anchor: string,
  today: string,
  previousExpenses: ExpenseDTO[],
): AnalyticsResponse {
  const anchorDate = dateAt(anchor);
  const anchorYear = anchorDate.getUTCFullYear();
  const anchorMonth = anchorDate.getUTCMonth();
  let from: string;
  let to: string;
  let previousFrom: string;
  let previousTo: string;
  let timeline: TimelinePoint[];
  let previousTimeline: TimelinePoint[];
  let heatmapFrom: string;
  let heatmapCount: number;
  let summaryFrom: string;
  let summaryTo: string;
  let elapsedFrom: string;
  let elapsedTo: string;

  if (period === "daily") {
    from = to = anchor;
    summaryFrom = summaryTo = anchor;
    const timelineFrom = addDays(anchor, -13);
    const previousTimelineFrom = addDays(timelineFrom, -14);
    timeline = makeDailyBuckets(timelineFrom, 14, expenses, period);
    previousTimeline = makeDailyBuckets(previousTimelineFrom, 14, previousExpenses, period);
    previousFrom = previousTo = addDays(anchor, -1);
    heatmapFrom = addDays(anchor, -104);
    heatmapCount = 105;
    elapsedFrom = timelineFrom;
    elapsedTo = anchor;
  } else if (period === "monthly") {
    from = firstOfMonth(anchor);
    to = lastOfMonth(anchor);
    const previousMonth = new Date(Date.UTC(anchorYear, anchorMonth - 1, 1));
    previousFrom = formatDay(previousMonth);
    previousTo = formatDay(new Date(Date.UTC(anchorYear, anchorMonth, 0)));
    summaryFrom = from;
    summaryTo = to;
    const monthDays = daysBetweenInclusive(from, to);
    const previousDays = daysBetweenInclusive(previousFrom, previousTo);
    timeline = makeDailyBuckets(from, monthDays, expenses, period);
    previousTimeline = Array.from({ length: monthDays }, (_, index) => {
      const day = index < previousDays ? addDays(previousFrom, index) : previousTo;
      return index < previousDays
        ? makePoint(day, pointLabel(day, period), previousExpenses.filter((entry) => entry.date === day))
        : { label: String(index + 1), date: day, total: 0, count: 0 };
    });
    heatmapFrom = from;
    heatmapCount = monthDays;
    elapsedFrom = from;
    elapsedTo = to < today ? to : today;
  } else {
    from = firstOfYear(anchorYear);
    to = lastOfYear(anchorYear);
    previousFrom = firstOfYear(anchorYear - 1);
    previousTo = lastOfYear(anchorYear - 1);
    summaryFrom = from;
    summaryTo = to;
    timeline = Array.from({ length: 12 }, (_, month) => {
      const day = `${anchorYear}-${String(month + 1).padStart(2, "0")}-01`;
      const monthEnd = formatDay(new Date(Date.UTC(anchorYear, month + 1, 0)));
      return makePoint(
        day,
        pointLabel(day, period),
        expenses.filter((entry) => entry.date >= day && entry.date <= monthEnd),
      );
    });
    previousTimeline = Array.from({ length: 12 }, (_, month) => {
      const day = `${anchorYear - 1}-${String(month + 1).padStart(2, "0")}-01`;
      const monthEnd = formatDay(new Date(Date.UTC(anchorYear - 1, month + 1, 0)));
      return makePoint(
        day,
        pointLabel(day, period),
        previousExpenses.filter((entry) => entry.date >= day && entry.date <= monthEnd),
      );
    });
    heatmapFrom = from;
    heatmapCount = daysBetweenInclusive(from, to);
    elapsedFrom = from;
    elapsedTo = to < today ? to : today;
  }

  const currentEntries = expenses.filter((entry) => entry.date >= summaryFrom && entry.date <= summaryTo);
  const total = roundMoney(currentEntries.reduce((sum, item) => sum + item.amount, 0));
  const previousTotal = totalFor(previousExpenses, previousFrom, previousTo);
  const elapsedEnd = elapsedTo < elapsedFrom ? elapsedFrom : elapsedTo;
  const elapsedDays = Math.max(1, daysBetweenInclusive(elapsedFrom, elapsedEnd));
  const timelineTotal = roundMoney(timeline.reduce((sum, item) => sum + item.total, 0));
  const activeDays = new Set(currentEntries.map((entry) => entry.date)).size;
  const totalCount = currentEntries.length;
  const monthElapsedCount = Math.max(1, Math.min(12, Number(today.slice(5, 7))));
  const elapsedMonths = today.slice(0, 4) === String(anchorYear)
    ? monthElapsedCount
    : today < from
      ? 1
      : 12;

  const weekdayEntries = expenses.filter((entry) => entry.date >= elapsedFrom && entry.date <= elapsedTo);
  const weekdayDays = elapsedTo < elapsedFrom ? 0 : daysBetweenInclusive(elapsedFrom, elapsedTo);
  const weekdayOccurrences = Array(7).fill(0) as number[];
  for (let index = 0; index < weekdayDays; index += 1) {
    const weekday = (dateAt(addDays(elapsedFrom, index)).getUTCDay() + 6) % 7;
    weekdayOccurrences[weekday] += 1;
  }
  const weekdayTotals = Array(7).fill(0) as number[];
  const weekdayCounts = Array(7).fill(0) as number[];
  for (const entry of weekdayEntries) {
    const weekday = (dateAt(entry.date).getUTCDay() + 6) % 7;
    weekdayTotals[weekday] += entry.amount;
    weekdayCounts[weekday] += 1;
  }

  const categoryTrendKeys = buildBreakdown(
    period === "daily"
      ? expenses.filter((entry) => entry.date >= addDays(anchor, -13) && entry.date <= anchor)
      : expenses.filter((entry) => entry.date >= from && entry.date <= to),
    (entry) => entry.category,
  ).slice(0, 5).map((item) => item.key);
  const categoryTrend = timeline.map((bucket) => {
    const matching = period === "yearly"
      ? expenses.filter((entry) => entry.date.slice(0, 7) === bucket.date.slice(0, 7))
      : expenses.filter((entry) => entry.date === bucket.date);
    const values: Partial<Record<CategoryKey, number>> = {};
    for (const key of categoryTrendKeys) {
      values[key] = roundMoney(
        matching.filter((entry) => entry.category === key).reduce((sum, item) => sum + item.amount, 0),
      );
    }
    return { label: bucket.label, date: bucket.date, values };
  });

  const heatmap = Array.from({ length: heatmapCount }, (_, index) => {
    const day = addDays(heatmapFrom, index);
    return {
      date: day,
      total: roundMoney(expenses.filter((entry) => entry.date === day).reduce((sum, item) => sum + item.amount, 0)),
    };
  });

  const dailyAverage = period === "daily"
    // Daily summary is one day, but its average uses the full 14-day timeline window.
    ? roundMoney(timelineTotal / 14)
    : roundMoney(total / elapsedDays);

  return {
    period,
    range: { from, to },
    summary: {
      total,
      count: totalCount,
      avgPerTransaction: totalCount ? roundMoney(total / totalCount) : 0,
      avgPerDay: dailyAverage,
      avgPerMonth: period === "yearly" ? roundMoney(total / elapsedMonths) : null,
      highest: currentEntries.length
        ? currentEntries.reduce((highest, entry) => entry.amount > highest.amount ? entry : highest)
        : null,
      previousTotal,
      changePct: previousTotal === 0 ? null : Math.round(((total - previousTotal) / previousTotal) * 1000) / 10,
      activeDays,
    },
    byCategory: buildBreakdown(currentEntries, (entry) => entry.category),
    byMode: buildBreakdown(currentEntries, (entry) => entry.paymentMode),
    timeline,
    previousTimeline,
    topNotes: makeTopNotes(currentEntries),
    weekday: WEEKDAYS.map((day, index) => ({
      day,
      total: roundMoney(weekdayTotals[index]),
      avg: weekdayOccurrences[index] ? roundMoney(weekdayTotals[index] / weekdayOccurrences[index]) : 0,
      count: weekdayCounts[index],
    })),
    heatmap,
    categoryTrend,
  };
}

export async function getAnalytics(userId: string, period: Period, anchor: string): Promise<AnalyticsResponse> {
  await connectDB();
  const day = dateAt(anchor);
  let from: string;
  let to: string;
  if (period === "daily") {
    from = addDays(anchor, -104);
    to = anchor;
  } else if (period === "monthly") {
    const currentFrom = firstOfMonth(anchor);
    const previousMonth = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth() - 1, 1));
    from = formatDay(previousMonth);
    to = lastOfMonth(anchor);
    if (currentFrom < from) from = currentFrom;
  } else {
    from = firstOfYear(day.getUTCFullYear() - 1);
    to = lastOfYear(day.getUTCFullYear());
  }
  const docs = await Expense.find({
    userId,
    date: { $gte: parseDay(from), $lte: new Date(parseDay(to).getTime() + DAY_MS - 1) },
  }).lean();
  const entries = docs.map((doc) => toExpenseDTO(doc as never));
  const splitDay = period === "daily" ? anchor : period === "monthly"
    ? firstOfMonth(anchor)
    : firstOfYear(day.getUTCFullYear());
  const previousEntries = entries.filter((entry) => entry.date < splitDay);
  return computeAnalytics(entries, period, anchor, formatDay(new Date()), previousEntries);
}
