import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { MonitoringCenterPanel } from '@/components/admin/ai-ops/MonitoringCenterPanel';

export default async function AiOpsAnalyticsPage() {
  await ensureAiCenterAccess('ai.view');
  return <MonitoringCenterPanel />;
}
