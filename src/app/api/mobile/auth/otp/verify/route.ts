import { z } from "zod";

import { jsonError, jsonOk } from "@/lib/api-response";
import { MOBILE_SESSION_MAX_AGE } from "@/lib/mobile-auth/constants";
import { verifyMobileCustomerOtp } from "@/lib/mobile-auth/otp-service";
import { signMobileCustomerToken } from "@/lib/mobile-auth/jwt";
import { getMobileJwtSecret } from "@/lib/mobile-auth/secrets";

const bodySchema = z
  .object({
    phone: z.string().min(8).max(32),
    code: z.string().min(4).max(10),
  })
  .strict();

/**
 * Verifies SMS OTP and returns a Bearer JWT for mobile customer APIs.
 */
export async function POST(request: Request) {
  if (!getMobileJwtSecret()) {
    return jsonError(
      "SERVER_MISCONFIGURED",
      "Mobile authentication is not configured on the server",
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

  const verified = await verifyMobileCustomerOtp(
    parsed.data.phone,
    parsed.data.code,
  );
  if (!verified.ok) {
    return jsonError(verified.code, verified.message, verified.httpStatus);
  }

  let accessToken: string;
  try {
    accessToken = await signMobileCustomerToken(verified.userId);
  } catch {
    return jsonError(
      "SERVER_MISCONFIGURED",
      "Could not issue access token",
      500,
    );
  }

  return jsonOk({
    accessToken,
    expiresInSeconds: MOBILE_SESSION_MAX_AGE,
    tokenType: "Bearer" as const,
  });
}
