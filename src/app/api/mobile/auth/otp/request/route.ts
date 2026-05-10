import { z } from "zod";

import { jsonError, jsonOk } from "@/lib/api-response";
import { getOtpConfig } from "@/lib/mobile-auth/otp-env";
import { OTP_MSG } from "@/lib/mobile-auth/otp-messages";
import { requestMobileCustomerOtp } from "@/lib/mobile-auth/otp-service";
import { getMobileJwtSecret } from "@/lib/mobile-auth/secrets";

const bodySchema = z
  .object({
    phone: z.string().min(8).max(32),
  })
  .strict();

/**
 * Sends a one-time SMS code for customer login. Never returns the OTP in JSON.
 */
export async function POST(request: Request) {
  if (!getMobileJwtSecret()) {
    return jsonError("SERVER_MISCONFIGURED", OTP_MSG.serverMisconfigured, 500);
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

  const result = await requestMobileCustomerOtp(parsed.data.phone);
  if (!result.ok) {
    return jsonError(result.code, result.message, result.httpStatus);
  }

  return jsonOk({
    sent: true as const,
    otpTtlSeconds: getOtpConfig().ttlSeconds,
  });
}
