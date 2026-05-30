import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { AiSettingsPanel } from '@/components/admin/ai-ops/AiSettingsPanel';

export default async function AiOpsSettingsPage() {
  await ensureAiCenterAccess('ai.manage');
  return <AiSettingsPanel />;
}
