import type { NextResponse } from "next/server";

import { jsonError } from "@/lib/api-response";

import type { AdminPanelActor } from "./panel-classify";
import {
  ADMIN_ENTERPRISE_CAPABILITIES,
  adminCan,
  getAdminPanelRoleAccessMatrix,
  type AdminRoleAccessRow,
  type ServiceInstanceAdminCapability,
} from "./permissions-core";

export type {
  AdminRoleAccessRow,
  ServiceInstanceAdminCapability,
} from "./permissions-core";
export {
  ADMIN_ENTERPRISE_CAPABILITIES,
  adminCan,
  getAdminPanelRoleAccessMatrix,
};

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
