import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { FailoverPanel } from '@/components/admin/ai-ops/FailoverPanel';

export default async function AiOpsFailoverPage() {
  await ensureAiCenterAccess('ai.view');
  return <FailoverPanel />;
}
