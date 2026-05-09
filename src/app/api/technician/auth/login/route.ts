import bcrypt from "bcryptjs";
import { z } from "zod";

import {
  ProviderStatus,
  UserRole,
  UserStatus,
} from "@/generated/prisma/client";
import { jsonError, jsonOk } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { setTechnicianSessionCookie } from "@/lib/technician-auth/cookies";
import { signTechnicianToken } from "@/lib/technician-auth/jwt";
import { getTechnicianJwtSecret } from "@/lib/technician-auth/secrets";

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

  if (!getTechnicianJwtSecret()) {
    return jsonError(
      "SERVER_MISCONFIGURED",
      "Technician JWT secret is not configured on the server",
      500,
    );
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    include: { aiTechnicianProfile: true },
  });

  const canUseTechnicianPanel =
    user &&
    user.role === UserRole.AI_TECHNICIAN &&
    user.status === UserStatus.ACTIVE &&
    user.aiTechnicianProfile &&
    user.aiTechnicianProfile.providerStatus === ProviderStatus.ACTIVE;

  if (!canUseTechnicianPanel || !user) {
    return jsonError("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return jsonError("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  let token: string;
  try {
    token = await signTechnicianToken(user.id, user.email);
  } catch {
    return jsonError(
      "SERVER_MISCONFIGURED",
      "Could not issue session token",
      500,
    );
  }

  const displayName = user.aiTechnicianProfile?.displayName ?? null;
  const res = jsonOk({
    user: {
      id: user.id,
      email: user.email,
      displayName,
      name: displayName ?? user.email,
      role: "AI_TECHNICIAN" as const,
    },
  });

  setTechnicianSessionCookie(res, token);

  return res;
}
