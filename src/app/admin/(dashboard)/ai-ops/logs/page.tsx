import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { AiLogsPanel } from '@/components/admin/ai-ops/AiLogsPanel';

export default async function AiOpsLogsPage() {
  await ensureAiCenterAccess('ai.view');
  return <AiLogsPanel />;
}
