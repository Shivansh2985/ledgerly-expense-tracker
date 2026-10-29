import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAnalytics } from "@/lib/analytics";
import { parseDay, todayUTC } from "@/lib/dates";
import type { Period } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const params = new URL(request.url).searchParams;
  const period = params.get("period") ?? "monthly";
  if (period !== "daily" && period !== "monthly" && period !== "yearly") {
    return NextResponse.json({ error: "period must be daily, monthly, or yearly" }, { status: 400 });
  }
  const anchor = params.get("date") ?? todayUTC();
  try {
    parseDay(anchor);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid date" }, { status: 400 });
  }
  try {
    return NextResponse.json(await getAnalytics(auth, period as Period, anchor));
  } catch {
    return NextResponse.json({ error: "Unable to load analytics" }, { status: 500 });
  }
}
