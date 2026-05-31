import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { OperationsCenterPanel } from '@/components/admin/ai-ops/OperationsCenterPanel';

export default async function AiOpsOperationsPage() {
  await ensureAiCenterAccess('ai.view');
  return <OperationsCenterPanel />;
}
