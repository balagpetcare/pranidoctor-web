import type { NextResponse } from "next/server";

import { UserRole, UserStatus } from "@/generated/prisma/client";
import { jsonError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

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
 * Requires `Authorization: Bearer <jwt>` issued for audience `mobile` and role `CUSTOMER`,
 * with an active user and existing CustomerProfile. Admin cookies are ignored.
 */
export async function requireMobileCustomer(
  request: Request,
): Promise<RequireMobileCustomerResult> {
  const token = extractBearer(request);
  if (!token) {
    return {
      ok: false,
      response: jsonError(
        "UNAUTHORIZED",
        "Authorization Bearer token required",
        401,
      ),
    };
  }

  const payload = await verifyMobileJwt(token);
  if (!payload) {
    return {
      ok: false,
      response: jsonError("UNAUTHORIZED", "Invalid or expired token", 401),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { customerProfile: true },
  });

  if (
    !user ||
    user.role !== UserRole.CUSTOMER ||
    user.status !== UserStatus.ACTIVE ||
    !user.customerProfile
  ) {
    return {
      ok: false,
      response: jsonError(
        "FORBIDDEN",
        "Customer account required for this resource",
        403,
      ),
    };
  }

  return {
    ok: true,
    ctx: {
      userId: user.id,
      customerProfileId: user.customerProfile.id,
    },
  };
}
