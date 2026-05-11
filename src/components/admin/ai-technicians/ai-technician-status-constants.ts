/**
 * String values mirror Prisma `AiTechnicianStatus` — used in admin client
 * components to avoid importing `@/generated/prisma/client` in the browser bundle.
 */
export const AI_TECHNICIAN_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  NEEDS_CORRECTION: "NEEDS_CORRECTION",
  APPROVED: "APPROVED",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
} as const;

export type AiTechnicianApplicationStatus =
  (typeof AI_TECHNICIAN_STATUS)[keyof typeof AI_TECHNICIAN_STATUS];
