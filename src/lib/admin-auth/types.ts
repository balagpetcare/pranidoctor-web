import type { UserRole } from "@/lib/admin-auth/user-role";

import type { ServiceInstanceAdminCapability } from "./permissions";

/** Resolved admin user from `GET /api/admin/auth/me`. */
export type AdminSessionUser = {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
};

export type AdminAuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AdminLoginPayload = {
  password: string;
  email?: string;
  identifier?: string;
};

export type AdminLoginResult = {
  user: AdminSessionUser;
};

export type AdminAuthContextValue = {
  status: AdminAuthStatus;
  user: AdminSessionUser | null;
  /** True while `/api/admin/auth/me` is in flight. */
  syncing: boolean;
  login: (payload: AdminLoginPayload, remember?: boolean) => Promise<AdminLoginResult>;
  logout: (reason?: "manual" | "idle" | "expired") => Promise<void>;
  /** Calls `/api/admin/auth/me` — backend touches panel session (`touchJwtSession`). */
  refreshSession: () => Promise<AdminSessionUser | null>;
  /** Alias for `refreshSession` — keeps profile in sync with backend. */
  syncProfile: () => Promise<AdminSessionUser | null>;
  can: (capability: ServiceInstanceAdminCapability) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
};
