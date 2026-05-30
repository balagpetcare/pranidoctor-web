import { redirect } from "next/navigation";

import type { UserRole } from "@/lib/admin-auth/user-role";

import { adminCan, assertAdminCan, type ServiceInstanceAdminCapability } from "./permissions";
import type { AdminPanelActor } from "./panel-classify";
import { resolveAdminPanelActor } from "./panel-access";
import { getAdminSession } from "./session";

/**
 * Server-side gate for the admin dashboard route group. Complements Edge middleware
 * (JWT-only) with a backend `/me` check so revoked roles cannot render the shell.
 */
export async function ensureAdminDashboardAccess(): Promise<void> {
  await getAdminDashboardActor();
}

/** Returns the active admin actor or redirects to login. */
export async function getAdminDashboardActor(): Promise<AdminPanelActor> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const actor = await resolveAdminPanelActor(session);
  if (!actor) {
    redirect("/api/admin/auth/session-invalid");
  }

  return actor;
}

/** Server route guard — requires one of the given roles. */
export async function ensureAdminRole(...roles: UserRole[]): Promise<AdminPanelActor> {
  const actor = await getAdminDashboardActor();
  if (!roles.includes(actor.role)) {
    redirect("/admin/access-denied");
  }
  return actor;
}

/** Server permission guard — redirects when capability is missing. */
export async function ensureAdminCapability(
  capability: ServiceInstanceAdminCapability,
): Promise<AdminPanelActor> {
  const actor = await getAdminDashboardActor();
  if (!adminCan(actor, capability)) {
    redirect("/admin/access-denied");
  }
  return actor;
}

/** Non-redirecting check for RSC pages. */
export async function getAdminCapabilityOrNull(
  capability: ServiceInstanceAdminCapability,
): Promise<AdminPanelActor | null> {
  const actor = await getAdminDashboardActor().catch(() => null);
  if (!actor || !adminCan(actor, capability)) return null;
  return actor;
}

export { assertAdminCan };
