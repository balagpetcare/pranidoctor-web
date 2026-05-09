import bcrypt from "bcryptjs";
import { z } from "zod";

import { setAdminSessionCookie } from "@/lib/admin-auth/cookies";
import { signAdminToken } from "@/lib/admin-auth/jwt";
import { getAdminJwtSecret } from "@/lib/admin-auth/secrets";
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

  if (!getAdminJwtSecret()) {
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

  const isPanelAdmin =
    user &&
    (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) &&
    user.status === UserStatus.ACTIVE &&
    user.adminProfile;

  if (!isPanelAdmin || !user) {
    return jsonError("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return jsonError("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  const sessionRole =
    user.role === UserRole.SUPER_ADMIN ? "SUPER_ADMIN" : "ADMIN";

  let token: string;
  try {
    token = await signAdminToken(user.id, user.email, sessionRole);
  } catch {
    return jsonError(
      "SERVER_MISCONFIGURED",
      "Could not issue session token",
      500,
    );
  }

  const displayName = user.adminProfile?.displayName ?? null;
  const res = jsonOk({
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
