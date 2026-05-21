import type { UserRole } from "@/lib/admin-auth/user-role";

import { adminCan } from "@/lib/admin-auth/permissions-core";
import {
  ADMIN_ENTERPRISE_CAPABILITIES,
  type ServiceInstanceAdminCapability,
} from "@/lib/admin-auth/permissions-core";
import type { AdminPanelActor } from "@/lib/admin-auth/panel-classify";

import type { AdminNavGroup, AdminNavItem } from "./admin-nav";

/** Returns whether a nav item is visible for the signed-in admin actor. */
export function navItemVisibleForActor(
  item: AdminNavItem,
  actor: AdminPanelActor | null,
  options?: { authLoading?: boolean },
): boolean {
  if (options?.authLoading) {
    if (item.roles?.length || item.capability) return false;
    return true;
  }
  if (!actor) return false;
  if (item.roles?.length && !item.roles.includes(actor.role)) {
    return false;
  }
  if (item.capability && !adminCan(actor, item.capability)) {
    return false;
  }
  return true;
}

export function filterAdminNavGroupsForActor(
  groups: AdminNavGroup[],
  actor: AdminPanelActor | null,
  options?: { authLoading?: boolean },
): AdminNavGroup[] {
  return groups
    .map((g) => ({
      ...g,
      children: g.children.filter((c) => navItemVisibleForActor(c, actor, options)),
    }))
    .filter((g) => g.children.length > 0);
}

export type AdminCapabilitySummary = {
  id: ServiceInstanceAdminCapability;
  labelBn: string;
  granted: boolean;
};

export function getAdminCapabilitySummaries(
  actor: AdminPanelActor | null,
): AdminCapabilitySummary[] {
  if (!actor) return [];
  return ADMIN_ENTERPRISE_CAPABILITIES.map((s) => ({
    ...s,
    granted: adminCan(actor, s.id),
  }));
}

export function roleLabelBn(role: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "সুপার অ্যাডমিন";
    case "ADMIN":
      return "অ্যাডমিন";
    case "SUPPORT":
      return "সাপোর্ট";
    default:
      return role;
  }
}
