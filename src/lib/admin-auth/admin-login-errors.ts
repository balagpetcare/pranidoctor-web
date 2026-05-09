import { Prisma } from "@/generated/prisma/client";

/** JSON `error.code` values for `POST /api/admin/auth/login`. */
export type AdminLoginErrorCode =
  | "invalid_credentials"
  | "db_unavailable"
  | "server_error";

const DB_KNOWN_REQUEST_CODES = new Set([
  "P1000",
  "P1001",
  "P1002",
  "P1003",
  "P1010",
  "P1011",
  "P1017",
]);

/**
 * Classifies errors from Prisma/pg during login so we can return `db_unavailable`
 * without leaking connection details to the client.
 */
export function isAdminLoginDatabaseConnectivityError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return DB_KNOWN_REQUEST_CODES.has(error.code);
  }
  if (error instanceof Error) {
    const m = error.message.toLowerCase();
    if (m.includes("password authentication failed")) return true;
    if (m.includes("connection refused")) return true;
    if (m.includes("connect econnrefused")) return true;
    if (m.includes("can't reach database server")) return true;
    if (m.includes("the database server is not running")) return true;
    if (m.includes("server closed the connection")) return true;
    if (m.includes("timeout") && m.includes("connection")) return true;
  }
  return false;
}

/**
 * Safe structured logs for login failures (never password, JWT, cookies, or DATABASE_URL).
 */
export function logAdminLoginFailure(
  code: AdminLoginErrorCode,
  meta?: { prismaCode?: string },
): void {
  const line = `[pranidoctor][admin-login] failure code=${code}${
    meta?.prismaCode ? ` prismaCode=${meta.prismaCode}` : ""
  }`;
  if (code === "invalid_credentials") {
    console.info(line);
  } else {
    console.warn(line);
  }
}
