import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword, setAuthCookie, signToken, toPublicUser } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    await connectDB();
    const email = parsed.data.email.trim().toLowerCase();
    if (await User.exists({ email })) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    const user = await User.create({
      name: parsed.data.name,
      email,
      passwordHash: await hashPassword(parsed.data.password),
    });
    const response = NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
    setAuthCookie(response.cookies, await signToken(user._id.toString()));
    return response;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create account" }, { status: 500 });
  }
}
