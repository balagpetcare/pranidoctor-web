import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { AiRiskPanel } from '@/components/admin/ai-ops/AiRiskPanel';

export default async function AiOpsRiskPage() {
  await ensureAiCenterAccess('ai.view');
  return <AiRiskPanel />;
}
