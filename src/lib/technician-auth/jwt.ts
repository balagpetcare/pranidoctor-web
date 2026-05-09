import { SignJWT, jwtVerify } from "jose";

import { TECHNICIAN_SESSION_MAX_AGE } from "./constants";
import { getTechnicianJwtSecret } from "./secrets";

const ALG = "HS256";

function getEncodedSecret(): Uint8Array {
  const secret = getTechnicianJwtSecret();
  if (!secret) {
    throw new Error(
      "TECHNICIAN_JWT_SECRET, DOCTOR_JWT_SECRET, or AUTH_SECRET must be set and at least 32 characters long",
    );
  }
  return new TextEncoder().encode(secret);
}

export type TechnicianJwtPayload = {
  sub: string;
  email: string;
  role: "AI_TECHNICIAN";
};

export async function signTechnicianToken(
  userId: string,
  email: string,
): Promise<string> {
  const secret = getEncodedSecret();
  return new SignJWT({ role: "AI_TECHNICIAN" as const, email })
    .setProtectedHeader({ alg: ALG })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${TECHNICIAN_SESSION_MAX_AGE}s`)
    .sign(secret);
}

export async function verifyTechnicianToken(
  token: string,
): Promise<TechnicianJwtPayload | null> {
  try {
    const secret = getTechnicianJwtSecret();
    if (!secret) {
      return null;
    }
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: [ALG],
    });
    if (payload.role !== "AI_TECHNICIAN") return null;
    if (typeof payload.sub !== "string") return null;
    if (typeof payload.email !== "string") return null;
    return {
      sub: payload.sub,
      email: payload.email,
      role: "AI_TECHNICIAN",
    };
  } catch {
    return null;
  }
}
