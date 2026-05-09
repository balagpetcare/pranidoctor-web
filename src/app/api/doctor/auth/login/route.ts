import bcrypt from "bcryptjs";
import { z } from "zod";

import { jsonError, jsonOk } from "@/lib/api-response";
import { setDoctorSessionCookie } from "@/lib/doctor-auth/cookies";
import { signDoctorToken } from "@/lib/doctor-auth/jwt";
import { getDoctorJwtSecret } from "@/lib/doctor-auth/secrets";
import { prisma } from "@/lib/prisma";
import {
  ProviderStatus,
  UserRole,
  UserStatus,
} from "@/generated/prisma/client";

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

  if (!getDoctorJwtSecret()) {
    return jsonError(
      "SERVER_MISCONFIGURED",
      "Doctor JWT secret is not configured on the server",
      500,
    );
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    include: { doctorProfile: true },
  });

  const canUseDoctorPanel =
    user &&
    user.role === UserRole.DOCTOR &&
    user.status === UserStatus.ACTIVE &&
    user.doctorProfile &&
    user.doctorProfile.providerStatus === ProviderStatus.ACTIVE;

  if (!canUseDoctorPanel || !user) {
    return jsonError("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return jsonError("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  let token: string;
  try {
    token = await signDoctorToken(user.id, user.email);
  } catch {
    return jsonError(
      "SERVER_MISCONFIGURED",
      "Could not issue session token",
      500,
    );
  }

  const displayName = user.doctorProfile?.displayName ?? null;
  const res = jsonOk({
    user: {
      id: user.id,
      email: user.email,
      displayName,
      name: displayName ?? user.email,
      role: "DOCTOR" as const,
    },
  });

  setDoctorSessionCookie(res, token);

  return res;
}
