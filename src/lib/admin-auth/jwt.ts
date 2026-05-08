import { SignJWT, jwtVerify } from "jose";

const ALG = "HS256";

function getEncodedSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_JWT_SECRET must be set and at least 32 characters long",
    );
  }
  return new TextEncoder().encode(secret);
}

export type AdminJwtPayload = {
  sub: string;
  email: string;
  role: "ADMIN";
};

export async function signAdminToken(userId: string, email: string): Promise<string> {
  const secret = getEncodedSecret();
  return new SignJWT({ role: "ADMIN" as const, email })
    .setProtectedHeader({ alg: ALG })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/** Edge-safe verification for middleware and server code. */
export async function verifyAdminToken(
  token: string,
): Promise<AdminJwtPayload | null> {
  try {
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret || secret.length < 32) {
      return null;
    }
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: [ALG],
    });
    if (payload.role !== "ADMIN") return null;
    if (typeof payload.sub !== "string") return null;
    if (typeof payload.email !== "string") return null;
    return { sub: payload.sub, email: payload.email, role: "ADMIN" };
  } catch {
    return null;
  }
}
