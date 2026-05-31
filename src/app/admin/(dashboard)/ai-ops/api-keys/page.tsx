import { adminCan } from '@/lib/admin-auth/permissions';
import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { ApiKeysPanel } from '@/components/admin/ai-ops/ApiKeysPanel';

export default async function AiOpsApiKeysPage() {
  const actor = await ensureAiCenterAccess('ai.secrets.view');
  return (
    <ApiKeysPanel
      canManageSecrets={adminCan(actor, 'ai.secrets.manage')}
      canOperateSecrets={adminCan(actor, 'ai.secrets.view')}
    />
  );
}
