import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { parseDay } from "@/lib/dates";
import { toExpenseDTO } from "@/lib/expense-dto";
import { expensePatchSchema } from "@/lib/validation";
import Expense from "@/models/Expense";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: { id: string } };

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  if (!Types.ObjectId.isValid(params.id)) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = expensePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  try {
    await connectDB();
    const update: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.date) update.date = parseDay(parsed.data.date);
    const expense = await Expense.findOneAndUpdate(
      { _id: params.id, userId: new Types.ObjectId(auth) },
      { $set: update },
      { returnDocument: "after", runValidators: true },
    );
    if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    return NextResponse.json({ expense: toExpenseDTO(expense) });
  } catch {
    return NextResponse.json({ error: "Unable to update expense" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  if (!Types.ObjectId.isValid(params.id)) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  try {
    await connectDB();
    const result = await Expense.deleteOne({ _id: params.id, userId: new Types.ObjectId(auth) });
    if (!result.deletedCount) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete expense" }, { status: 500 });
  }
}
