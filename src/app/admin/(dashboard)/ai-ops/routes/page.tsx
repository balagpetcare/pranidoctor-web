import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { RoutePanel } from '@/components/admin/ai-ops/RoutePanel';

export default async function AiOpsRoutesPage() {
  await ensureAiCenterAccess('ai.view');
  return <RoutePanel />;
}
