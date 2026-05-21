import type { NextResponse } from "next/server";

import { jsonError } from "@/lib/api-response";
import { verifyMobileJwt } from "./jwt";

export type MobileCustomerContext = {
  userId: string;
  customerProfileId: string;
};

export type RequireMobileCustomerResult =
  | { ok: true; ctx: MobileCustomerContext }
  | { ok: false; response: NextResponse };

function extractBearer(request: Request): string | null {
  const raw = request.headers.get("authorization")?.trim();
  if (!raw) return null;
  const m = /^Bearer\s+(.+)$/i.exec(raw);
  return m?.[1]?.trim() || null;
}

/**
 * JWT gate only on web — profile resolution runs on backend API routes.
 */
export async function requireMobileCustomer(
  request: Request,
): Promise<RequireMobileCustomerResult> {
  const token = extractBearer(request);
  if (!token) {
    return {
      ok: false,
      response: jsonError("UNAUTHORIZED", "Authorization Bearer token required", 401),
    };
  }

  const payload = await verifyMobileJwt(token);
  if (!payload) {
    return {
      ok: false,
      response: jsonError("UNAUTHORIZED", "Invalid or expired token", 401),
    };
  }

  return {
    ok: true,
    ctx: { userId: payload.sub, customerProfileId: payload.sub },
  };
}
