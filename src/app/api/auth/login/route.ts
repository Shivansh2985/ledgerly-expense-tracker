import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { setAuthCookie, signToken, toPublicUser, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import User from "@/models/User";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await User.findOne({ email: parsed.data.email.trim().toLowerCase() });
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const response = NextResponse.json({ user: toPublicUser(user) });
    setAuthCookie(response.cookies, await signToken(user._id.toString()));
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to log in" }, { status: 500 });
  }
}
