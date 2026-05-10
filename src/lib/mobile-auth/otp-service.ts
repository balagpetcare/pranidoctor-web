import bcrypt from "bcryptjs";
import { randomBytes, randomInt } from "node:crypto";

import { UserRole, UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { dispatchMobileOtpDelivery } from "./otp-dispatch";
import { getOtpConfig, warnIfProdDevOtpMode } from "./otp-env";
import {
  OTP_MSG,
  otpHourlyRateLimitMessage,
  otpResendCooldownMessage,
} from "./otp-messages";
import { normalizeBdMobilePhone } from "./phone";

export type OtpServiceFailure = {
  ok: false;
  httpStatus: number;
  code: string;
  message: string;
};

export type OtpRequestSuccess = { ok: true };

export type OtpVerifySuccess = { ok: true; userId: string };

class RateLimitHourlyError extends Error {
  override name = "RateLimitHourlyError";
}

class OtpCooldownError extends Error {
  constructor(readonly secondsRemaining: number) {
    super("OTP_COOLDOWN");
    this.name = "OtpCooldownError";
  }
}

function generateNumericOtp(length: number): string {
  const max = 10 ** length;
  return randomInt(0, max).toString().padStart(length, "0");
}

export async function requestMobileCustomerOtp(
  rawPhone: string,
): Promise<OtpRequestSuccess | OtpServiceFailure> {
  warnIfProdDevOtpMode();
  const cfg = getOtpConfig();
  const normalizedPhone = normalizeBdMobilePhone(rawPhone);
  if (!normalizedPhone) {
    return {
      ok: false,
      httpStatus: 422,
      code: "VALIDATION_ERROR",
      message: OTP_MSG.validationPhone,
    };
  }

  let plainCode: string;

  try {
    plainCode = await prisma.$transaction(async (tx) => {
      const row = await tx.mobileOtpChallenge.findUnique({
        where: { normalizedPhone },
      });

      const now = new Date();

      if (
        row?.lastOtpSentAt &&
        cfg.resendCooldownSeconds > 0 &&
        now.getTime() - row.lastOtpSentAt.getTime() <
          cfg.resendCooldownSeconds * 1000
      ) {
        const elapsed = Math.floor(
          (now.getTime() - row.lastOtpSentAt.getTime()) / 1000,
        );
        const remaining = Math.max(0, cfg.resendCooldownSeconds - elapsed);
        throw new OtpCooldownError(remaining);
      }

      let windowStart = row?.sendWindowStartedAt ?? null;
      let sendsInWindow = row?.sendsInWindow ?? 0;

      if (
        !windowStart ||
        now.getTime() - windowStart.getTime() > cfg.sendWindowMs
      ) {
        windowStart = now;
        sendsInWindow = 0;
      }

      if (sendsInWindow >= cfg.maxSendsPerHour) {
        throw new RateLimitHourlyError();
      }

      const code = generateNumericOtp(cfg.length);
      const codeHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(now.getTime() + cfg.ttlSeconds * 1000);

      await tx.mobileOtpChallenge.upsert({
        where: { normalizedPhone },
        create: {
          normalizedPhone,
          codeHash,
          expiresAt,
          verifyAttempts: 0,
          sendWindowStartedAt: windowStart,
          sendsInWindow: sendsInWindow + 1,
          lastOtpSentAt: now,
        },
        update: {
          codeHash,
          expiresAt,
          verifyAttempts: 0,
          sendWindowStartedAt: windowStart,
          sendsInWindow: sendsInWindow + 1,
          lastOtpSentAt: now,
        },
      });

      return code;
    });
  } catch (e) {
    if (e instanceof OtpCooldownError) {
      return {
        ok: false,
        httpStatus: 429,
        code: "RESEND_COOLDOWN",
        message: otpResendCooldownMessage(e.secondsRemaining),
      };
    }
    if (e instanceof RateLimitHourlyError) {
      return {
        ok: false,
        httpStatus: 429,
        code: "RATE_LIMITED",
        message: otpHourlyRateLimitMessage(),
      };
    }
    console.error("[mobile-otp] request transaction failed", e);
    return {
      ok: false,
      httpStatus: 500,
      code: "OTP_REQUEST_FAILED",
      message: OTP_MSG.requestFailed,
    };
  }

  const expiresAt = new Date(Date.now() + cfg.ttlSeconds * 1000);
  const delivered = await dispatchMobileOtpDelivery({
    normalizedPhone,
    plainCode,
    ttlSeconds: cfg.ttlSeconds,
    expiresAt,
  });

  if (!delivered.ok) {
    try {
      await prisma.mobileOtpChallenge.deleteMany({
        where: { normalizedPhone },
      });
    } catch (delErr) {
      console.error("[mobile-otp] rollback challenge after SMS failure", delErr);
    }
    const missingGateway = delivered.reason === "SMS_NOT_CONFIGURED";
    return {
      ok: false,
      httpStatus: 503,
      code: missingGateway ? "SMS_NOT_CONFIGURED" : "SMS_UNAVAILABLE",
      message: missingGateway
        ? OTP_MSG.smsNotConfigured
        : OTP_MSG.smsUnavailable,
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
        message: OTP_MSG.loginNotAllowed,
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
      message: OTP_MSG.signupFailed,
    };
  }
}

export async function verifyMobileCustomerOtp(
  rawPhone: string,
  rawCode: string,
): Promise<OtpVerifySuccess | OtpServiceFailure> {
  const cfg = getOtpConfig();
  const normalizedPhone = normalizeBdMobilePhone(rawPhone);
  const code = rawCode.replace(/\s/g, "");
  const codeOk = new RegExp(`^\\d{${cfg.length}}$`).test(code);

  if (!normalizedPhone || !codeOk) {
    return {
      ok: false,
      httpStatus: 401,
      code: "WRONG_OTP",
      message: OTP_MSG.wrongCode,
    };
  }

  const challenge = await prisma.mobileOtpChallenge.findUnique({
    where: { normalizedPhone },
  });

  if (!challenge) {
    return {
      ok: false,
      httpStatus: 401,
      code: "EXPIRED_OTP",
      message: OTP_MSG.expired,
    };
  }

  const now = new Date();
  if (challenge.expiresAt.getTime() <= now.getTime()) {
    await prisma.mobileOtpChallenge.deleteMany({
      where: { normalizedPhone },
    });
    return {
      ok: false,
      httpStatus: 401,
      code: "EXPIRED_OTP",
      message: OTP_MSG.expired,
    };
  }

  if (challenge.verifyAttempts >= cfg.maxAttempts) {
    await prisma.mobileOtpChallenge.deleteMany({
      where: { normalizedPhone },
    });
    return {
      ok: false,
      httpStatus: 401,
      code: "TOO_MANY_ATTEMPTS",
      message: OTP_MSG.tooManyAttempts,
    };
  }

  const matches = await bcrypt.compare(code, challenge.codeHash);
  if (!matches) {
    const nextAttempts = challenge.verifyAttempts + 1;
    if (nextAttempts >= cfg.maxAttempts) {
      await prisma.mobileOtpChallenge.deleteMany({
        where: { normalizedPhone },
      });
      return {
        ok: false,
        httpStatus: 401,
        code: "TOO_MANY_ATTEMPTS",
        message: OTP_MSG.tooManyAttempts,
      };
    }
    await prisma.mobileOtpChallenge.update({
      where: { normalizedPhone },
      data: { verifyAttempts: { increment: 1 } },
    });
    return {
      ok: false,
      httpStatus: 401,
      code: "WRONG_OTP",
      message: OTP_MSG.wrongCode,
    };
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
