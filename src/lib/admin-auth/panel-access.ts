import { UserRole, UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { AdminJwtPayload } from "./jwt";
import type { AdminPanelActor } from "./panel-classify";

export type { AdminPanelActor } from "./panel-classify";

/**
 * Authoritative check: JWT subject must be an ACTIVE user with ADMIN or SUPER_ADMIN role
 * and an AdminProfile row. Use on API routes, `/api/admin/auth/me`, and dashboard layout.
 */
export async function resolveAdminPanelActor(
  session: AdminJwtPayload,
): Promise<AdminPanelActor | null> {
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      adminProfile: { select: { id: true, displayName: true } },
    },
  });

  if (!user?.adminProfile) return null;
  const roleOk =
    user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
  if (!roleOk || user.status !== UserStatus.ACTIVE) return null;

  return {
    id: user.id,
    email: user.email,
    displayName: user.adminProfile.displayName,
  };
}
