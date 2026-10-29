import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionUserId, toPublicUser } from "@/lib/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ user: toPublicUser(user) });
  } catch {
    return NextResponse.json({ error: "Unable to load user" }, { status: 500 });
  }
}
