import { z } from "zod";

import { jsonError, jsonOk } from "@/lib/api-response";
import { MOBILE_SESSION_MAX_AGE } from "@/lib/mobile-auth/constants";
import {
  registerCustomerWithPassword,
  serializeAuthUser,
} from "@/lib/mobile-auth/customer-credentials-service";
import { signMobileCustomerToken } from "@/lib/mobile-auth/jwt";
import { getMobileJwtSecret } from "@/lib/mobile-auth/secrets";
import { prisma } from "@/lib/prisma";

const bodySchema = z
  .object({
    name: z.string().min(1).max(120),
    mobile: z.string().min(8).max(32),
    email: z.union([z.string().email().max(200), z.literal("")]).optional(),
    password: z.string().min(6).max(200),
  })
  .strict();

/**
 * Register a new mobile customer with password — same JWT envelope as OTP verify.
 * POST /api/mobile/auth/register
 */
export async function POST(request: Request) {
  if (!getMobileJwtSecret()) {
    return jsonError(
      "SERVER_MISCONFIGURED",
      "Authentication is not configured on this server.",
      500,
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return jsonError(
      "VALIDATION_ERROR",
      "Invalid payload",
      422,
      parsed.error.flatten(),
    );
  }

  const emailRaw = parsed.data.email;
  const result = await registerCustomerWithPassword({
    name: parsed.data.name,
    rawMobile: parsed.data.mobile,
    rawEmail: emailRaw === "" ? undefined : emailRaw,
    password: parsed.data.password,
  });
  if (!result.ok) {
    return jsonError(result.code, result.message, result.httpStatus);
  }

  let accessToken: string;
  try {
    accessToken = await signMobileCustomerToken(result.userId);
  } catch {
    return jsonError(
      "SERVER_MISCONFIGURED",
      "Could not issue session token.",
      500,
    );
  }

  const userRow = await prisma.user.findUnique({
    where: { id: result.userId },
    include: { customerProfile: true },
  });
  if (!userRow?.customerProfile) {
    return jsonError("NOT_FOUND", "Customer profile missing", 404);
  }

  return jsonOk({
    accessToken,
    expiresInSeconds: MOBILE_SESSION_MAX_AGE,
    tokenType: "Bearer" as const,
    user: serializeAuthUser({
      id: userRow.id,
      email: userRow.email,
      phone: userRow.phone,
      customerProfile: { displayName: userRow.customerProfile.displayName },
    }),
  });
}
