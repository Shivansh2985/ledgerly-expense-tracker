import "server-only";
import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/constants";
import type { PublicUser } from "@/lib/types";

const TOKEN_AGE_SECONDS = 7 * 24 * 60 * 60;

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set. Add it to .env.local before starting the app.");
  return new TextEncoder().encode(secret);
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

type CookieTarget = {
  set: (
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      sameSite: "lax";
      secure: boolean;
      path: string;
      maxAge: number;
    },
  ) => unknown;
};

export function setAuthCookie(target: CookieTarget, token: string) {
  target.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_AGE_SECONDS,
  });
}

export function clearAuthCookie(target: CookieTarget) {
  target.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUserId(): Promise<string | null> {
  const token = cookies().get(AUTH_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function requireUser() {
  const userId = await getSessionUserId();
  return userId ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function toPublicUser(doc: {
  _id: { toString(): string };
  name: string;
  email: string;
  currency: string;
  createdAt: Date;
}): PublicUser {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    currency: doc.currency,
    createdAt: doc.createdAt.toISOString(),
  };
}
