import type { CategoryKey, PaymentModeKey } from "./constants";

export type Period = "daily" | "monthly" | "yearly";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  currency: string;
  createdAt: string;
}

export interface ExpenseDTO {
  id: string;
  amount: number;
  category: CategoryKey;
  paymentMode: PaymentModeKey;
  note: string;
  /** Calendar date as YYYY-MM-DD (stored as UTC midnight) */
  date: string;
  createdAt: string;
}

export interface ExpenseInput {
  amount: number;
  category: CategoryKey;
  paymentMode: PaymentModeKey;
  note: string;
  date: string; // YYYY-MM-DD
}

export interface ExpenseListResponse {
  items: ExpenseDTO[];
  total: number; // number of matching docs
  sum: number; // sum of amounts of matching docs
  page: number;
  limit: number;
}

export interface Breakdown<K extends string> {
  key: K;
  total: number;
  count: number;
  pct: number; // 0-100 share of period total
}

export interface TimelinePoint {
  label: string; // display label e.g. "12 Oct", "Mar"
  date: string; // YYYY-MM-DD (bucket start)
  total: number;
  count: number;
}

export interface AnalyticsResponse {
  period: Period;
  range: { from: string; to: string }; // inclusive YYYY-MM-DD
  summary: {
    total: number;
    count: number;
    avgPerTransaction: number;
    avgPerDay: number; // total / days elapsed in range (capped at today)
    avgPerMonth: number | null; // yearly only
    highest: ExpenseDTO | null;
    previousTotal: number; // same-length previous period
    changePct: number | null; // null if previousTotal == 0
    activeDays: number; // days with >= 1 expense
  };
  byCategory: Breakdown<CategoryKey>[]; // sorted desc by total, only non-zero
  byMode: Breakdown<PaymentModeKey>[]; // sorted desc by total, only non-zero
  timeline: TimelinePoint[];
  previousTimeline: TimelinePoint[]; // aligned bucket-by-bucket with timeline, for comparison
  topNotes: { note: string; total: number; count: number; category: CategoryKey }[]; // top 8
  weekday: { day: string; total: number; avg: number; count: number }[]; // Mon..Sun
  heatmap: { date: string; total: number }[]; // every day in range (yearly: whole year, monthly: month, daily: last 7*15 days)
  categoryTrend: { label: string; date: string; values: Partial<Record<CategoryKey, number>> }[]; // same buckets as timeline, top 5 categories
}

export interface StatementResponse {
  user: PublicUser;
  range: { from: string; to: string };
  generatedAt: string;
  items: ExpenseDTO[]; // sorted by date asc
  totals: { total: number; count: number; avgPerDay: number; days: number };
  byCategory: Breakdown<CategoryKey>[];
  byMode: Breakdown<PaymentModeKey>[];
}
