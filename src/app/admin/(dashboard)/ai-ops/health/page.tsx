import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { HealthPanel } from '@/components/admin/ai-ops/HealthPanel';

export default async function AiOpsHealthPage() {
  await ensureAiCenterAccess('ai.view');
  return <HealthPanel />;
}
