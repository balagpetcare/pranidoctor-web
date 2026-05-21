import { serverInternalJson } from "@/lib/server-internal";

import type { DoctorJwtPayload } from "./jwt";
import type { DoctorPanelActor } from "./panel-classify";

export type { DoctorPanelActor } from "./panel-classify";

type MeResponse = {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    doctorProfileId: string;
  };
};

export async function resolveDoctorPanelActor(
  _session: DoctorJwtPayload,
): Promise<DoctorPanelActor | null> {
  const res = await serverInternalJson<MeResponse>("/api/doctor/auth/me");
  if (!res.ok) return null;
  const u = res.data.user;
  return {
    userId: u.id,
    doctorProfileId: u.doctorProfileId,
    email: u.email,
    displayName: u.displayName,
  };
}
