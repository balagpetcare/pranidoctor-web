import { ensureAdminCapability } from "./dashboard-guard";
import type { AdminPanelActor } from "./panel-classify";
import type { ServiceInstanceAdminCapability } from "./permissions-core";

export type FeedIntelligenceCapability =
  | "ai.feed.view"
  | "ai.feed.manage"
  | "ai.feed.publish"
  | "ai.feed.audit";

export async function ensureFeedIntelligenceAccess(
  capability: FeedIntelligenceCapability = "ai.feed.view",
): Promise<AdminPanelActor> {
  return ensureAdminCapability(capability as ServiceInstanceAdminCapability);
}
