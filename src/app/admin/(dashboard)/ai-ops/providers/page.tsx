import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { ProviderPanel } from '@/components/admin/ai-ops/ProviderPanel';

export default async function AiOpsProvidersPage() {
  await ensureAiCenterAccess('ai.view');
  return <ProviderPanel />;
}
