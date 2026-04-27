import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes   = ["/", "/marketplace", "/pro-hub", "/login", "/register", "/pricing"];
const publicPrefixes = ["/marketplace", "/pro-hub", "/courses", "/pricing"];
const authRoutes     = ["/login", "/register"];
// These are in (landing) now but require auth
const protectedLandingRoutes = ["/notifications", "/profile"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow: static files, API routes, public pages
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".") ||
    publicPrefixes.some(p => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({ headers: request.headers });

  // Redirect authenticated users from home → feed
  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (session && authRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  // Protect landing routes that still require auth
  const needsAuth =
    protectedLandingRoutes.some(r => pathname.startsWith(r)) ||
    (!publicRoutes.includes(pathname) && !authRoutes.some(r => pathname.startsWith(r)));

  if (!session && needsAuth) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Admin-only routes
  if (pathname.startsWith("/admin")) {
    const u = session?.user as unknown as { role?: string } | undefined;
    if (!session || u?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/feed", request.url));
    }
  }

  // ── Referral cookie ─────────────────────────────────────────
  const ref = request.nextUrl.searchParams.get("ref");
  const response = NextResponse.next();
  if (ref && /^[a-zA-Z0-9_-]{6,32}$/.test(ref)) {
    response.cookies.set("ref_code", ref, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
