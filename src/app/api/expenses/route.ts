import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { CATEGORY_KEYS, PAYMENT_MODE_KEYS } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { parseDay } from "@/lib/dates";
import { toExpenseDTO } from "@/lib/expense-dto";
import { requireUser } from "@/lib/auth";
import { expenseInputSchema } from "@/lib/validation";
import Expense from "@/models/Expense";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const sortOptions = {
  date_desc: { date: -1, createdAt: -1 },
  date_asc: { date: 1, createdAt: -1 },
  amount_desc: { amount: -1, createdAt: -1 },
  amount_asc: { amount: 1, createdAt: -1 },
} as const;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const params = new URL(request.url).searchParams;
  const from = params.get("from");
  const to = params.get("to");
  const category = params.get("category");
  const mode = params.get("mode");
  const q = params.get("q")?.trim();
  const page = Number(params.get("page") ?? 1);
  const limit = Number(params.get("limit") ?? 20);
  const sort = params.get("sort") ?? "date_desc";

  if (!Number.isInteger(page) || page < 1) {
    return NextResponse.json({ error: "page must be a positive integer" }, { status: 400 });
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
    return NextResponse.json({ error: "limit must be between 1 and 200" }, { status: 400 });
  }
  if (!(sort in sortOptions)) {
    return NextResponse.json({ error: "Invalid sort option" }, { status: 400 });
  }
  if (category && !(CATEGORY_KEYS as readonly string[]).includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (mode && !(PAYMENT_MODE_KEYS as readonly string[]).includes(mode)) {
    return NextResponse.json({ error: "Invalid payment mode" }, { status: 400 });
  }

  const filter: Record<string, unknown> = { userId: new Types.ObjectId(auth) };
  const dateFilter: Record<string, Date> = {};
  try {
    if (from) dateFilter.$gte = parseDay(from);
    if (to) {
      const end = parseDay(to);
      end.setUTCDate(end.getUTCDate() + 1);
      dateFilter.$lt = end;
    }
    if (from && to && from > to) {
      return NextResponse.json({ error: "from must be on or before to" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid date filter" }, { status: 400 });
  }
  if (Object.keys(dateFilter).length) filter.date = dateFilter;
  if (category) filter.category = category;
  if (mode) filter.paymentMode = mode;
  if (q) filter.note = { $regex: escapeRegex(q), $options: "i" };

  try {
    await connectDB();
    const [items, totals] = await Promise.all([
      Expense.find(filter)
        .sort(sortOptions[sort as keyof typeof sortOptions])
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: 1 }, sum: { $sum: "$amount" } } },
      ]),
    ]);
    return NextResponse.json({
      items: items.map((item) => toExpenseDTO(item as never)),
      total: totals[0]?.total ?? 0,
      sum: Math.round(((totals[0]?.sum ?? 0) + Number.EPSILON) * 100) / 100,
      page,
      limit,
    });
  } catch {
    return NextResponse.json({ error: "Unable to list expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = expenseInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  try {
    await connectDB();
    const expense = await Expense.create({
      ...parsed.data,
      userId: new Types.ObjectId(auth),
      date: parseDay(parsed.data.date),
    });
    return NextResponse.json({ expense: toExpenseDTO(expense) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create expense" }, { status: 500 });
  }
}
