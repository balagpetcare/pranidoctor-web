import { ensureAiCenterAccess } from '@/lib/admin-auth/ai-ops-guard';
import { KnowledgeList } from '@/components/admin/ai-ops/KnowledgeList';

export default async function AiOpsKnowledgePage() {
  await ensureAiCenterAccess('ai.view');
  return <KnowledgeList />;
}
