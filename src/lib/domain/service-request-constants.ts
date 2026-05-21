/**
 * Service request enum values — mirrors Prisma without importing generated client
 * in browser bundles (admin lists, doctor case UI, labels).
 */
export const SERVICE_REQUEST_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
} as const;

export type ServiceRequestStatus =
  (typeof SERVICE_REQUEST_STATUS)[keyof typeof SERVICE_REQUEST_STATUS];

export const SERVICE_REQUEST_TYPE = {
  DOCTOR_HOME_VISIT: "DOCTOR_HOME_VISIT",
  EMERGENCY_DOCTOR: "EMERGENCY_DOCTOR",
  AI_SERVICE: "AI_SERVICE",
  ONLINE_CONSULTATION_LATER: "ONLINE_CONSULTATION_LATER",
} as const;

export type ServiceRequestType =
  (typeof SERVICE_REQUEST_TYPE)[keyof typeof SERVICE_REQUEST_TYPE];
