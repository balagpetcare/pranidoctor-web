import bcrypt from "bcryptjs";
import { z } from "zod";

import {
  isAdminLoginDatabaseConnectivityError,
  logAdminLoginFailure,
} from "@/lib/admin-auth/admin-login-errors";
import { setAdminSessionCookie } from "@/lib/admin-auth/cookies";
import { signAdminToken } from "@/lib/admin-auth/jwt";
import { getAdminJwtSecret } from "@/lib/admin-auth/secrets";
import { jsonError, jsonOk } from "@/lib/api-response";
import { normalizeBdMobilePhone } from "@/lib/mobile-auth/phone";
import { prisma } from "@/lib/prisma";
import { Prisma, UserRole, UserStatus } from "@/generated/prisma/client";

const bodySchema = z.object({
  /** Legacy clients — any string; validated when treated as an email address. */
  email: z.string().trim().optional(),
  /** Preferred: admin email or Bangladesh mobile (matches `User.email` / `User.phone`). */
  identifier: z.string().trim().optional(),
  password: z.string().min(1),
});

function resolveLoginIdentifier(data: z.infer<typeof bodySchema>): string {
  const fromEmail = data.email?.trim() || "";
  const fromId = data.identifier?.trim() || "";
  return fromEmail || fromId;
}

function buildAdminUserWhere(loginId: string): Prisma.UserWhereInput {
  const id = loginId.trim();
  if (id.includes("@")) {
    return { email: { equals: id, mode: "insensitive" } };
  }
  const normalized = normalizeBdMobilePhone(id);
  const phones = new Set<string>();
  if (normalized) phones.add(normalized);
  phones.add(id);
  return { OR: [...phones].map((phone) => ({ phone })) };
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    logAdminLoginFailure("server_error");
    return jsonError(
      "server_error",
      "Request body must be valid JSON",
      400,
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    logAdminLoginFailure("server_error");
    return jsonError(
      "server_error",
      "Invalid email or password payload",
      422,
      parsed.error.flatten(),
    );
  }

  const loginId = resolveLoginIdentifier(parsed.data);
  if (!loginId) {
    logAdminLoginFailure("server_error");
    return jsonError(
      "server_error",
      "Invalid email or password payload",
      422,
    );
  }

  if (loginId.includes("@")) {
    const emailOk = z.string().email().safeParse(loginId);
    if (!emailOk.success) {
      logAdminLoginFailure("server_error");
      return jsonError(
        "server_error",
        "Invalid email or password payload",
        422,
        emailOk.error.flatten(),
      );
    }
  }

  const { password } = parsed.data;

  if (!getAdminJwtSecret()) {
    logAdminLoginFailure("server_error");
    return jsonError(
      "server_error",
      "Admin session signing is not configured on the server",
      500,
    );
  }

  let user;
  try {
    user = await prisma.user.findFirst({
      where: buildAdminUserWhere(loginId),
      include: { adminProfile: true },
    });
  } catch (e: unknown) {
    if (isAdminLoginDatabaseConnectivityError(e)) {
      const prismaCode =
        e instanceof Prisma.PrismaClientKnownRequestError ? e.code : undefined;
      logAdminLoginFailure("db_unavailable", prismaCode ? { prismaCode } : undefined);
      return jsonError(
        "db_unavailable",
        "Could not reach the database",
        503,
      );
    }
    const prismaCode =
      e instanceof Prisma.PrismaClientKnownRequestError ? e.code : undefined;
    logAdminLoginFailure("server_error", prismaCode ? { prismaCode } : undefined);
    return jsonError("server_error", "Unexpected error during sign-in", 500);
  }

  const isPanelAdmin =
    user &&
    (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) &&
    user.status === UserStatus.ACTIVE &&
    user.adminProfile;

  if (!isPanelAdmin || !user) {
    logAdminLoginFailure("invalid_credentials");
    return jsonError(
      "invalid_credentials",
      "Invalid email or password",
      401,
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    logAdminLoginFailure("invalid_credentials");
    return jsonError(
      "invalid_credentials",
      "Invalid email or password",
      401,
    );
  }

  const sessionRole =
    user.role === UserRole.SUPER_ADMIN ? "SUPER_ADMIN" : "ADMIN";

  let token: string;
  try {
    token = await signAdminToken(user.id, user.email, sessionRole);
  } catch {
    logAdminLoginFailure("server_error");
    return jsonError(
      "server_error",
      "Could not issue session token",
      500,
    );
  }

  const displayName = user.adminProfile?.displayName ?? null;
  const res = jsonOk({
    result: "success" as const,
    user: {
      id: user.id,
      email: user.email,
      displayName,
      name: displayName ?? user.email,
      role: sessionRole,
    },
  });

  setAdminSessionCookie(res, token);

  return res;
}
