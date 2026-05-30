import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth/constants";
import { verifyAdminToken } from "@/lib/admin-auth/jwt";
import { getSafeAdminNextPath } from "@/lib/admin-auth/safe-next-path";
import { DOCTOR_SESSION_COOKIE } from "@/lib/doctor-auth/constants";
import { verifyDoctorToken } from "@/lib/doctor-auth/jwt";
import {
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
} from "@/lib/logging/constants";
import { resolveRequestCorrelation } from "@/lib/logging/correlation";

const ADMIN_LOGIN_PATH = "/admin/login";
const DOCTOR_LOGIN_PATH = "/doctor/login";

/** Static assets that may live under panel paths without auth. */
const PANEL_STATIC_FILE =
  /\.(?:ico|png|jpg|jpeg|gif|svg|webp|txt|xml|webmanifest)$/i;

function attachObservabilityHeaders(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const ids = resolveRequestCorrelation(request.headers);
  response.headers.set(REQUEST_ID_HEADER, ids.requestId);
  response.headers.set(CORRELATION_ID_HEADER, ids.correlationId);
  return response;
}

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

async function guardAdminPanelHtml(
  request: NextRequest,
  pathname: string,
): Promise<NextResponse> {
  if (PANEL_STATIC_FILE.test(pathname)) {
    return attachObservabilityHeaders(request, NextResponse.next());
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifyAdminToken(token) : null;

  if (isAdminLoginPath(pathname)) {
    if (session) {
      const next = request.nextUrl.searchParams.get("next");
      const destination = getSafeAdminNextPath(next);
      return attachObservabilityHeaders(
        request,
        NextResponse.redirect(new URL(destination, request.url)),
      );
    }
    return attachObservabilityHeaders(request, NextResponse.next());
  }

  if (!session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ADMIN_LOGIN_PATH;
    loginUrl.searchParams.set("next", pathname);
    return attachObservabilityHeaders(
      request,
      NextResponse.redirect(loginUrl),
    );
  }

  return attachObservabilityHeaders(request, NextResponse.next());
}

/**
 * Panel auth proxy — `/admin`, `/enterprise`, and `/doctor` HTML routes only.
 * Does not touch `/_next`, `/api`, root `public/` URLs, or mobile APIs.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    return guardAdminPanelHtml(request, pathname);
  }

  if (pathname.startsWith("/enterprise")) {
    return guardAdminPanelHtml(request, pathname);
  }

  if (pathname.startsWith("/doctor")) {
    if (PANEL_STATIC_FILE.test(pathname)) {
      return attachObservabilityHeaders(request, NextResponse.next());
    }

    const token = request.cookies.get(DOCTOR_SESSION_COOKIE)?.value;
    const session = token ? await verifyDoctorToken(token) : null;

    if (isDoctorLoginPath(pathname)) {
      if (session) {
        return attachObservabilityHeaders(
          request,
          NextResponse.redirect(new URL("/doctor", request.url)),
        );
      }
      return attachObservabilityHeaders(request, NextResponse.next());
    }

    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = DOCTOR_LOGIN_PATH;
      loginUrl.searchParams.set("next", pathname);
      return attachObservabilityHeaders(
        request,
        NextResponse.redirect(loginUrl),
      );
    }

    return attachObservabilityHeaders(request, NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/enterprise",
    "/enterprise/:path*",
    "/doctor",
    "/doctor/:path*",
  ],
};
