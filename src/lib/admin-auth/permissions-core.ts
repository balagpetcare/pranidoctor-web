import type { AdminPanelActor } from "./panel-classify";
import { USER_ROLE, type UserRole } from "./user-role";

export type ServiceInstanceAdminCapability =
  | "serviceInstance.view"
  | "serviceInstance.review"
  | "serviceInstance.publish";

export const ADMIN_ENTERPRISE_CAPABILITIES: {
  id: ServiceInstanceAdminCapability;
  labelBn: string;
}[] = [
  { id: "serviceInstance.view", labelBn: "এন্টারপ্রাইজ সেবা দেখা" },
  { id: "serviceInstance.review", labelBn: "এন্টারপ্রাইজ পর্যালোচনা" },
  { id: "serviceInstance.publish", labelBn: "এন্টারপ্রাইজ প্রকাশ" },
];

export type AdminRoleAccessRow = {
  role: UserRole;
  labelBn: string;
  capabilities: Record<ServiceInstanceAdminCapability, boolean>;
};

const ROLE_MATRIX: Record<
  UserRole,
  Partial<Record<ServiceInstanceAdminCapability, true>> | undefined
> = {
  [USER_ROLE.SUPER_ADMIN]: {
    "serviceInstance.view": true,
    "serviceInstance.review": true,
    "serviceInstance.publish": true,
  },
  [USER_ROLE.ADMIN]: {
    "serviceInstance.view": true,
    "serviceInstance.review": true,
  },
  [USER_ROLE.SUPPORT]: {
    "serviceInstance.view": true,
  },
  [USER_ROLE.CUSTOMER]: undefined,
  [USER_ROLE.DOCTOR]: undefined,
  [USER_ROLE.AI_TECHNICIAN]: undefined,
};

export function adminCan(
  actor: AdminPanelActor,
  capability: ServiceInstanceAdminCapability,
): boolean {
  return !!ROLE_MATRIX[actor.role]?.[capability];
}

const PANEL_ROLE_LABELS: Partial<Record<UserRole, string>> = {
  [USER_ROLE.SUPER_ADMIN]: "সুপার অ্যাডমিন",
  [USER_ROLE.ADMIN]: "অ্যাডমিন",
  [USER_ROLE.SUPPORT]: "সাপোর্ট",
};

/** Panel roles that may sign in to /admin (read-only matrix for settings UI). */
export function getAdminPanelRoleAccessMatrix(): AdminRoleAccessRow[] {
  const panelRoles: UserRole[] = [
    USER_ROLE.SUPER_ADMIN,
    USER_ROLE.ADMIN,
    USER_ROLE.SUPPORT,
  ];
  return panelRoles.map((role) => ({
    role,
    labelBn: PANEL_ROLE_LABELS[role] ?? role,
    capabilities: Object.fromEntries(
      ADMIN_ENTERPRISE_CAPABILITIES.map((cap) => [
        cap.id,
        !!ROLE_MATRIX[role]?.[cap.id],
      ]),
    ) as Record<ServiceInstanceAdminCapability, boolean>,
  }));
}
