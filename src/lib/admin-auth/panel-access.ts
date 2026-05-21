import { serverInternalJson } from "@/lib/server-internal";

import type { AdminJwtPayload } from "./jwt";
import type { AdminPanelActor } from "./panel-classify";

export type { AdminPanelActor } from "./panel-classify";

type MeResponse = {
  user: AdminPanelActor;
};

/**
 * Resolves admin actor via backend `/api/admin/auth/me` (no direct Prisma).
 */
export async function resolveAdminPanelActor(
  _session: AdminJwtPayload,
): Promise<AdminPanelActor | null> {
  const res = await serverInternalJson<MeResponse>("/api/admin/auth/me");
  if (!res.ok) return null;
  return res.data.user;
}
