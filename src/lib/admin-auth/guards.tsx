"use client";

import type { ReactNode } from "react";

import type { UserRole } from "@/lib/admin-auth/user-role";

import type { ServiceInstanceAdminCapability } from "./permissions";
import { useAdminAuth } from "./AdminAuthProvider";

export type AdminPermissionGuardProps = Readonly<{
  capability: ServiceInstanceAdminCapability;
  children: ReactNode;
  fallback?: ReactNode;
}>;

/** Hides children when the signed-in admin lacks a service-instance capability. */
export function AdminPermissionGuard({
  capability,
  children,
  fallback = null,
}: AdminPermissionGuardProps) {
  const { can, status } = useAdminAuth();
  if (status !== "authenticated") return fallback;
  if (!can(capability)) return fallback;
  return children;
}

export type AdminRoleGuardProps = Readonly<{
  roles: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
  /** When true, user must have one of `roles`. When false, user must NOT have any. */
  allow?: boolean;
}>;

/** Hides children based on admin `UserRole`. */
export function AdminRoleGuard({
  roles,
  children,
  fallback = null,
  allow = true,
}: AdminRoleGuardProps) {
  const { hasRole, status } = useAdminAuth();
  const list = Array.isArray(roles) ? roles : [roles];
  if (status !== "authenticated") return fallback;
  const match = hasRole(...list);
  if (allow ? !match : match) return fallback;
  return children;
}
