import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { daysBetweenInclusive, parseDay } from "@/lib/dates";
import { toExpenseDTO } from "@/lib/expense-dto";
import type { Breakdown, StatementResponse } from "@/lib/types";
import type { CategoryKey, PaymentModeKey } from "@/lib/constants";
import Expense from "@/models/Expense";
import User from "@/models/User";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function breakdown<K extends string>(items: { key: K; amount: number }[]): Breakdown<K>[] {
  const totals = new Map<K, { total: number; count: number }>();
  for (const item of items) {
    const group = totals.get(item.key) ?? { total: 0, count: 0 };
    group.total += item.amount;
    group.count += 1;
    totals.set(item.key, group);
  }
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return Array.from(totals.entries()).map(([key, value]) => ({
    key,
    total: Math.round((value.total + Number.EPSILON) * 100) / 100,
    count: value.count,
    pct: total ? Math.round((value.total / total) * 1000) / 10 : 0,
  })).sort((a, b) => b.total - a.total);
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const params = new URL(request.url).searchParams;
  const from = params.get("from");
  const to = params.get("to");
  if (!from || !to) return NextResponse.json({ error: "from and to are required" }, { status: 400 });

  let start: Date;
  let end: Date;
  try {
    start = parseDay(from);
    end = parseDay(to);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid date range" }, { status: 400 });
  }
  if (from > to) return NextResponse.json({ error: "from must be on or before to" }, { status: 400 });
  const maxEnd = new Date(start);
  maxEnd.setUTCFullYear(maxEnd.getUTCFullYear() + 3);
  if (end > maxEnd) return NextResponse.json({ error: "Date range cannot exceed three years" }, { status: 400 });

  try {
    await connectDB();
    const [user, docs] = await Promise.all([
      User.findById(auth),
      Expense.find({
        userId: new Types.ObjectId(auth),
        date: { $gte: start, $lt: new Date(end.getTime() + 86_400_000) },
      }).sort({ date: 1, createdAt: 1 }).lean(),
    ]);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const items = docs.map((doc) => toExpenseDTO(doc as never));
    const total = Math.round((items.reduce((sum, item) => sum + item.amount, 0) + Number.EPSILON) * 100) / 100;
    const days = daysBetweenInclusive(from, to);
    const response: StatementResponse = {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt.toISOString(),
      },
      range: { from, to },
      generatedAt: new Date().toISOString(),
      items,
      totals: {
        total,
        count: items.length,
        avgPerDay: Math.round((total / days + Number.EPSILON) * 100) / 100,
        days,
      },
      byCategory: breakdown(items.map((item) => ({ key: item.category as CategoryKey, amount: item.amount }))),
      byMode: breakdown(items.map((item) => ({ key: item.paymentMode as PaymentModeKey, amount: item.amount }))),
    };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Unable to generate statement" }, { status: 500 });
  }
}
