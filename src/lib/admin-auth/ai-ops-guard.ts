import { ensureAdminCapability } from "./dashboard-guard";
import type { AdminPanelActor } from "./panel-classify";
import type { ServiceInstanceAdminCapability } from "./permissions";

/** Server-side gate for AI Center (AI Ops) admin pages. */
export async function ensureAiCenterAccess(
  capability: ServiceInstanceAdminCapability = "ai.view",
): Promise<AdminPanelActor> {
  return ensureAdminCapability(capability);
}
