import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/constants";

const protectedPrefixes = ["/dashboard", "/expenses", "/analytics", "/statements"];

async function hasValidSession(token?: string) {
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const authPage = pathname === "/login" || pathname === "/signup";
  if (!protectedRoute && !authPage) return NextResponse.next();

  const authenticated = await hasValidSession(request.cookies.get(AUTH_COOKIE)?.value);
  if (protectedRoute && !authenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (authPage && authenticated) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
