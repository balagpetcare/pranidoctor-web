import type { NextResponse } from "next/server";

import { UserRole } from "@/generated/prisma/client";
import { jsonError } from "@/lib/api-response";

import type { AdminPanelActor } from "./panel-classify";

export type ServiceInstanceAdminCapability =
  | "serviceInstance.view"
  | "serviceInstance.review"
  | "serviceInstance.publish";

const ROLE_MATRIX: Record<
  UserRole,
  Partial<Record<ServiceInstanceAdminCapability, true>> | undefined
> = {
  [UserRole.SUPER_ADMIN]: {
    "serviceInstance.view": true,
    "serviceInstance.review": true,
    "serviceInstance.publish": true,
  },
  [UserRole.ADMIN]: {
    "serviceInstance.view": true,
    "serviceInstance.review": true,
  },
  [UserRole.SUPPORT]: {
    "serviceInstance.view": true,
  },
  [UserRole.CUSTOMER]: undefined,
  [UserRole.DOCTOR]: undefined,
  [UserRole.AI_TECHNICIAN]: undefined,
};

export function adminCan(
  actor: AdminPanelActor,
  capability: ServiceInstanceAdminCapability,
): boolean {
  return !!ROLE_MATRIX[actor.role]?.[capability];
}

export function assertAdminCan(
  actor: AdminPanelActor,
  capability: ServiceInstanceAdminCapability,
): NextResponse | null {
  if (!adminCan(actor, capability)) {
    return jsonError("FORBIDDEN", "এই কাজের জন্য অনুমতি নেই", 403, {
      capability,
    });
  }
  return null;
}
