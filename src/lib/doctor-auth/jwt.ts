import { SignJWT, jwtVerify } from "jose";

import { DOCTOR_SESSION_MAX_AGE } from "./constants";
import { getDoctorJwtSecret } from "./secrets";

const ALG = "HS256";

function getEncodedSecret(): Uint8Array {
  const secret = getDoctorJwtSecret();
  if (!secret) {
    throw new Error(
      "DOCTOR_JWT_SECRET or AUTH_SECRET must be set and at least 32 characters long",
    );
  }
  return new TextEncoder().encode(secret);
}

export type DoctorJwtPayload = {
  sub: string;
  email: string;
  role: "DOCTOR";
};

export async function signDoctorToken(
  userId: string,
  email: string,
): Promise<string> {
  const secret = getEncodedSecret();
  return new SignJWT({ role: "DOCTOR" as const, email })
    .setProtectedHeader({ alg: ALG })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${DOCTOR_SESSION_MAX_AGE}s`)
    .sign(secret);
}

/** Edge-safe verification for middleware and server code. */
export async function verifyDoctorToken(
  token: string,
): Promise<DoctorJwtPayload | null> {
  try {
    const secret = getDoctorJwtSecret();
    if (!secret) {
      return null;
    }
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: [ALG],
    });
    if (payload.role !== "DOCTOR") return null;
    if (typeof payload.sub !== "string") return null;
    if (typeof payload.email !== "string") return null;
    return {
      sub: payload.sub,
      email: payload.email,
      role: "DOCTOR",
    };
  } catch {
    return null;
  }
}
