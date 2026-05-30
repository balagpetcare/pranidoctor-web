import { NextResponse } from "next/server";

import { clearAdminSessionCookie } from "@/lib/admin-auth/cookies";
import { getSafeAdminNextPath } from "@/lib/admin-auth/safe-next-path";

/**
 * Clears a stale admin session cookie and redirects to login.
 * Route Handlers are the only place Next.js 16 allows cookie mutation.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const next = url.searchParams.get("next");
  const login = new URL("/admin/login", url.origin);
  login.searchParams.set("reason", "session_invalid");
  if (next) {
    login.searchParams.set("next", getSafeAdminNextPath(next));
  }

  const res = NextResponse.redirect(login);
  clearAdminSessionCookie(res);
  return res;
}
