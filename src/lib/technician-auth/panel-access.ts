import { serverInternalJson } from "@/lib/server-internal";

import type { TechnicianJwtPayload } from "./jwt";
import type { TechnicianPanelActor } from "./panel-classify";

export type { TechnicianPanelActor } from "./panel-classify";

type MeResponse = {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    aiTechnicianProfileId: string;
  };
};

export async function resolveTechnicianPanelActor(
  _session: TechnicianJwtPayload,
): Promise<TechnicianPanelActor | null> {
  const res = await serverInternalJson<MeResponse>("/api/technician/auth/me");
  if (!res.ok) return null;
  const u = res.data.user;
  return {
    userId: u.id,
    aiTechnicianProfileId: u.aiTechnicianProfileId,
    email: u.email,
    displayName: u.displayName,
  };
}
