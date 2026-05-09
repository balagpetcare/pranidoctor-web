import { ProviderStatus, UserRole, UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { DoctorJwtPayload } from "./jwt";
import type { DoctorPanelActor } from "./panel-classify";

export type { DoctorPanelActor } from "./panel-classify";

/**
 * JWT subject must be an ACTIVE doctor user with an ACTIVE provider profile.
 */
export async function resolveDoctorPanelActor(
  session: DoctorJwtPayload,
): Promise<DoctorPanelActor | null> {
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      doctorProfile: {
        select: {
          id: true,
          displayName: true,
          providerStatus: true,
        },
      },
    },
  });

  if (!user?.doctorProfile) return null;
  if (user.role !== UserRole.DOCTOR) return null;
  if (user.status !== UserStatus.ACTIVE) return null;
  if (user.doctorProfile.providerStatus !== ProviderStatus.ACTIVE) return null;

  return {
    userId: user.id,
    doctorProfileId: user.doctorProfile.id,
    email: user.email,
    displayName: user.doctorProfile.displayName,
  };
}
