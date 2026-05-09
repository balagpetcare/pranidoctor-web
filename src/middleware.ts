import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth/constants";
import { verifyAdminToken } from "@/lib/admin-auth/jwt";
import { DOCTOR_SESSION_COOKIE } from "@/lib/doctor-auth/constants";
import { verifyDoctorToken } from "@/lib/doctor-auth/jwt";

const ADMIN_LOGIN_PATH = "/admin/login";
const DOCTOR_LOGIN_PATH = "/doctor/login";

/** Static assets that may live under panel paths without auth. */
const PANEL_STATIC_FILE =
  /\.(?:ico|png|jpg|jpeg|gif|svg|webp|txt|xml|webmanifest)$/i;

function isAdminLoginPath(pathname: string): boolean {
  return (
    pathname === ADMIN_LOGIN_PATH ||
    pathname.startsWith(`${ADMIN_LOGIN_PATH}/`)
  );
}

function isDoctorLoginPath(pathname: string): boolean {
  return (
    pathname === DOCTOR_LOGIN_PATH ||
    pathname.startsWith(`${DOCTOR_LOGIN_PATH}/`)
  );
}

/**
 * Panel auth middleware — `/admin` and `/doctor` HTML routes only.
 * Does not touch `/_next`, `/api`, root `public/` URLs, or mobile APIs.
 * (`/technician` HTML shell and middleware can be added when the technician dashboard ships.)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (PANEL_STATIC_FILE.test(pathname)) {
      return NextResponse.next();
    }

    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = token ? await verifyAdminToken(token) : null;

    if (isAdminLoginPath(pathname)) {
      if (session) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = ADMIN_LOGIN_PATH;
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/doctor")) {
    if (PANEL_STATIC_FILE.test(pathname)) {
      return NextResponse.next();
    }

    const token = request.cookies.get(DOCTOR_SESSION_COOKIE)?.value;
    const session = token ? await verifyDoctorToken(token) : null;

    if (isDoctorLoginPath(pathname)) {
      if (session) {
        return NextResponse.redirect(new URL("/doctor", request.url));
      }
      return NextResponse.next();
    }

    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = DOCTOR_LOGIN_PATH;
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/doctor", "/doctor/:path*"],
};
