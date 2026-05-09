import { SignJWT, jwtVerify } from "jose";

import { MOBILE_SESSION_MAX_AGE } from "./constants";
import { getMobileJwtSecret } from "./secrets";

const ALG = "HS256";
const MOBILE_AUDIENCE = "mobile";

function getEncodedSecret(): Uint8Array {
  const secret = getMobileJwtSecret();
  if (!secret) {
    throw new Error(
      "MOBILE_JWT_SECRET or AUTH_SECRET must be set and at least 32 characters long",
    );
  }
  return new TextEncoder().encode(secret);
}

/** Claims stored in mobile customer access tokens. */
export type MobileJwtPayload = {
  sub: string;
  role: "CUSTOMER";
};

export async function signMobileCustomerToken(userId: string): Promise<string> {
  const secret = getEncodedSecret();
  return new SignJWT({ role: "CUSTOMER" as const })
    .setProtectedHeader({ alg: ALG })
    .setSubject(userId)
    .setAudience(MOBILE_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${MOBILE_SESSION_MAX_AGE}s`)
    .sign(secret);
}

/** Verifies HS256 JWT shape for mobile customers (cryptographic + audience only). */
export async function verifyMobileJwt(
  token: string,
): Promise<MobileJwtPayload | null> {
  try {
    const secret = getMobileJwtSecret();
    if (!secret) {
      return null;
    }
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      {
        algorithms: [ALG],
        audience: MOBILE_AUDIENCE,
      },
    );
    if (payload.role !== "CUSTOMER") return null;
    if (typeof payload.sub !== "string") return null;
    return {
      sub: payload.sub,
      role: "CUSTOMER",
    };
  } catch {
    return null;
  }
}
