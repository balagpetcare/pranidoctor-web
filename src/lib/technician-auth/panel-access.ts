import { ProviderStatus, UserRole, UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { TechnicianJwtPayload } from "./jwt";
import type { TechnicianPanelActor } from "./panel-classify";

export type { TechnicianPanelActor } from "./panel-classify";

export async function resolveTechnicianPanelActor(
  session: TechnicianJwtPayload,
): Promise<TechnicianPanelActor | null> {
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      aiTechnicianProfile: {
        select: {
          id: true,
          displayName: true,
          providerStatus: true,
        },
      },
    },
  });

  if (!user?.aiTechnicianProfile) return null;
  if (user.role !== UserRole.AI_TECHNICIAN) return null;
  if (user.status !== UserStatus.ACTIVE) return null;
  if (user.aiTechnicianProfile.providerStatus !== ProviderStatus.ACTIVE) {
    return null;
  }

  return {
    userId: user.id,
    aiTechnicianProfileId: user.aiTechnicianProfile.id,
    email: user.email,
    displayName: user.aiTechnicianProfile.displayName,
  };
}
