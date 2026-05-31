import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { AiGovernancePanel } from '@/components/admin/ai-ops/AiGovernancePanel';

export default async function AiOpsGovernancePage() {
  await ensureAiCenterAccess('ai.manage');
  return <AiGovernancePanel />;
}
