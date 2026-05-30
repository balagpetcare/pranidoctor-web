import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { MarketplacePanel } from '@/components/admin/ai-ops/MarketplacePanel';

export default async function AiOpsMarketplacePage() {
  await ensureAiCenterAccess('ai.view');
  return <MarketplacePanel />;
}
