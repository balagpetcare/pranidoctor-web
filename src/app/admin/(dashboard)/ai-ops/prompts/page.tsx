import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { PromptList } from '@/components/admin/ai-ops/PromptList';

export default async function AiOpsPromptsPage() {
  await ensureAiCenterAccess('ai.view');
  return <PromptList />;
}
