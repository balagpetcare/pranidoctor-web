import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { UsageAnalyticsPanel } from '@/components/admin/ai-ops/UsageAnalyticsPanel';

export default async function AiOpsAnalyticsPage() {
  await ensureAiCenterAccess('ai.view');
  return <UsageAnalyticsPanel />;
}
