import bcrypt from "bcryptjs";
import { randomBytes, randomInt } from "node:crypto";

import { UserRole, UserStatus } from "@/generated/prisma/client";
import { notifyOtpSms } from "@/lib/notifications/events";
import { prisma } from "@/lib/prisma";

import {
  MOBILE_OTP_MAX_SENDS_PER_HOUR,
  MOBILE_OTP_MAX_VERIFY_ATTEMPTS,
  MOBILE_OTP_SEND_WINDOW_MS,
  MOBILE_OTP_TTL_SECONDS,
} from "./otp-constants";
import { normalizeBdMobilePhone } from "./phone";

export type OtpServiceFailure = {
  ok: false;
  httpStatus: number;
  code: string;
  message: string;
};

export type OtpRequestSuccess = { ok: true };

export type OtpVerifySuccess = { ok: true; userId: string };

function otpGenericFailure(): OtpServiceFailure {
  return {
    ok: false,
    httpStatus: 401,
    code: "INVALID_OTP",
    message: "Invalid or expired verification code. Request a new code and try again.",
  };
}

export async function requestMobileCustomerOtp(
  rawPhone: string,
): Promise<OtpRequestSuccess | OtpServiceFailure> {
  const normalizedPhone = normalizeBdMobilePhone(rawPhone);
  if (!normalizedPhone) {
    return {
      ok: false,
      httpStatus: 422,
      code: "VALIDATION_ERROR",
      message: "Enter a valid Bangladesh mobile number.",
    };
  }

  let plainCode: string;

  try {
    plainCode = await prisma.$transaction(async (tx) => {
      const row = await tx.mobileOtpChallenge.findUnique({
        where: { normalizedPhone },
      });

      const now = new Date();
      let windowStart = row?.sendWindowStartedAt ?? null;
      let sendsInWindow = row?.sendsInWindow ?? 0;

      if (
        !windowStart ||
        now.getTime() - windowStart.getTime() > MOBILE_OTP_SEND_WINDOW_MS
      ) {
        windowStart = now;
        sendsInWindow = 0;
      }

      if (sendsInWindow >= MOBILE_OTP_MAX_SENDS_PER_HOUR) {
        throw Object.assign(new Error("RATE_LIMIT"), { name: "RateLimitError" });
      }

      const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
      const codeHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(
        now.getTime() + MOBILE_OTP_TTL_SECONDS * 1000,
      );

      await tx.mobileOtpChallenge.upsert({
        where: { normalizedPhone },
        create: {
          normalizedPhone,
          codeHash,
          expiresAt,
          verifyAttempts: 0,
          sendWindowStartedAt: windowStart,
          sendsInWindow: sendsInWindow + 1,
        },
        update: {
          codeHash,
          expiresAt,
          verifyAttempts: 0,
          sendWindowStartedAt: windowStart,
          sendsInWindow: sendsInWindow + 1,
        },
      });

      return code;
    });
  } catch (e) {
    if (e instanceof Error && e.name === "RateLimitError") {
      return {
        ok: false,
        httpStatus: 429,
        code: "RATE_LIMITED",
        message:
          "Too many verification codes requested for this number. Try again later.",
      };
    }
    console.error("[mobile-otp] request transaction failed", e);
    return {
      ok: false,
      httpStatus: 500,
      code: "OTP_REQUEST_FAILED",
      message: "Could not send verification code. Try again in a moment.",
    };
  }

  try {
    await notifyOtpSms({ phone: normalizedPhone, code: plainCode });
  } catch (e) {
    console.error("[mobile-otp] SMS send failed", e);
    return {
      ok: false,
      httpStatus: 503,
      code: "SMS_UNAVAILABLE",
      message: "Could not send SMS right now. Try again shortly.",
    };
  }

  return { ok: true };
}

async function ensureCustomerUserForPhone(
  normalizedPhone: string,
): Promise<{ ok: true; userId: string } | OtpServiceFailure> {
  const existing = await prisma.user.findFirst({
    where: { phone: normalizedPhone },
    include: { customerProfile: true },
  });

  if (existing) {
    if (
      existing.role !== UserRole.CUSTOMER ||
      existing.status !== UserStatus.ACTIVE ||
      !existing.customerProfile
    ) {
      return {
        ok: false,
        httpStatus: 403,
        code: "LOGIN_NOT_ALLOWED",
        message: "Unable to sign in with this phone number.",
      };
    }
    return { ok: true, userId: existing.id };
  }

  const email = `${normalizedPhone}@mobile-otp.pranidoctor.internal`;
  const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);

  try {
    const created = await prisma.user.create({
      data: {
        email,
        phone: normalizedPhone,
        passwordHash,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        customerProfile: {
          create: {
            displayName: `গ্রাহক ${normalizedPhone.slice(-4)}`,
          },
        },
      },
    });
    return { ok: true, userId: created.id };
  } catch (e) {
    console.error("[mobile-otp] customer bootstrap failed", e);
    return {
      ok: false,
      httpStatus: 500,
      code: "SIGNUP_FAILED",
      message: "Could not complete sign-in. Try again.",
    };
  }
}

export async function verifyMobileCustomerOtp(
  rawPhone: string,
  rawCode: string,
): Promise<OtpVerifySuccess | OtpServiceFailure> {
  const normalizedPhone = normalizeBdMobilePhone(rawPhone);
  const code = rawCode.replace(/\s/g, "");
  if (!normalizedPhone || !/^\d{6}$/.test(code)) {
    return otpGenericFailure();
  }

  const challenge = await prisma.mobileOtpChallenge.findUnique({
    where: { normalizedPhone },
  });

  if (!challenge) {
    return otpGenericFailure();
  }

  const now = new Date();
  if (challenge.expiresAt.getTime() <= now.getTime()) {
    await prisma.mobileOtpChallenge.deleteMany({
      where: { normalizedPhone },
    });
    return otpGenericFailure();
  }

  if (challenge.verifyAttempts >= MOBILE_OTP_MAX_VERIFY_ATTEMPTS) {
    await prisma.mobileOtpChallenge.deleteMany({
      where: { normalizedPhone },
    });
    return otpGenericFailure();
  }

  const matches = await bcrypt.compare(code, challenge.codeHash);
  if (!matches) {
    await prisma.mobileOtpChallenge.update({
      where: { normalizedPhone },
      data: { verifyAttempts: { increment: 1 } },
    });
    return otpGenericFailure();
  }

  await prisma.mobileOtpChallenge.deleteMany({
    where: { normalizedPhone },
  });

  const user = await ensureCustomerUserForPhone(normalizedPhone);
  if (!user.ok) {
    return user;
  }

  return { ok: true, userId: user.userId };
}
