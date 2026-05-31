import { adminCan } from '@/lib/admin-auth/permissions';
import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { ProviderPanel } from '@/components/admin/ai-ops/ProviderPanel';

export default async function AiOpsProvidersPage() {
  const actor = await ensureAiCenterAccess('ai.view');
  return <ProviderPanel canManageSecrets={adminCan(actor, 'ai.secrets.manage')} />;
}
