import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { AiOpsOverview } from '@/components/admin/ai-ops/AiOpsOverview';

export default async function AiOpsDashboardPage() {
  await ensureAiCenterAccess('ai.view');
  return <AiOpsOverview />;
}
