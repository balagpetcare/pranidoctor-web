import { NextResponse } from "next/server";

import { clearDoctorSessionCookie } from "@/lib/doctor-auth/cookies";
import { getSafeDoctorNextPath } from "@/lib/doctor-auth/safe-next-path";

/** Clears stale doctor session cookie (Next.js 16 — route handlers only). */
export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const next = url.searchParams.get("next");
  const login = new URL("/doctor/login", url.origin);
  login.searchParams.set("reason", "session_invalid");
  if (next) {
    login.searchParams.set("next", getSafeDoctorNextPath(next));
  }

  const res = NextResponse.redirect(login);
  clearDoctorSessionCookie(res);
  return res;
}
