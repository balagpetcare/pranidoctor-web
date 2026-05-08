import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } from "@/lib/admin-auth/constants";
import { signAdminToken } from "@/lib/admin-auth/jwt";
import { jsonError, jsonOk } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { UserRole, UserStatus } from "@/generated/prisma/client";

const bodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
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
      "Invalid email or password payload",
      422,
      parsed.error.flatten(),
    );
  }

  const { email, password } = parsed.data;

  if (
    !process.env.ADMIN_JWT_SECRET ||
    process.env.ADMIN_JWT_SECRET.length < 32
  ) {
    return jsonError(
      "SERVER_MISCONFIGURED",
      "Admin JWT secret is not configured on the server",
      500,
    );
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    include: { adminProfile: true },
  });

  if (
    !user ||
    user.role !== UserRole.ADMIN ||
    user.status !== UserStatus.ACTIVE ||
    !user.adminProfile
  ) {
    return jsonError("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return jsonError("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  let token: string;
  try {
    token = await signAdminToken(user.id, user.email);
  } catch {
    return jsonError(
      "SERVER_MISCONFIGURED",
      "Could not issue session token",
      500,
    );
  }

  const res = NextResponse.json(
    jsonOk({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.adminProfile.displayName,
      },
    }),
  );

  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  return res;
}
