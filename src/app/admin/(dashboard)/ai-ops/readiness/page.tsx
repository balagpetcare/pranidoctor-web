import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { ReadinessDashboardPanel } from '@/components/admin/ai-ops/ReadinessDashboardPanel';

export default async function AiOpsReadinessPage() {
  await ensureAiCenterAccess('ai.manage');
  return <ReadinessDashboardPanel />;
}
