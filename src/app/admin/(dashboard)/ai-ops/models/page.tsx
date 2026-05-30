import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { ModelPanel } from '@/components/admin/ai-ops/ModelPanel';

export default async function AiOpsModelsPage() {
  await ensureAiCenterAccess('ai.view');
  return <ModelPanel />;
}
