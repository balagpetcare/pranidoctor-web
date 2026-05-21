/**
 * Panel role values — mirrors Prisma `UserRole` without importing `@/generated/prisma/client`
 * in client bundles (nav, permissions, auth provider).
 */
export const USER_ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  SUPPORT: "SUPPORT",
  CUSTOMER: "CUSTOMER",
  DOCTOR: "DOCTOR",
  AI_TECHNICIAN: "AI_TECHNICIAN",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
