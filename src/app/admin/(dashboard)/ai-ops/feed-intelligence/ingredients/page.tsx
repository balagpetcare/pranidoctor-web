import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedIngredientList } from '@/components/admin/feed-intelligence/FeedIngredientList';
import { FeedIntelligenceShell } from '@/components/admin/feed-intelligence/FeedIntelligenceShell';
import { ensureFeedIntelligenceAccess } from '@/lib/admin-auth/feed-intelligence-guard';

export default async function FeedIngredientsPage() {
  await ensureFeedIntelligenceAccess('ai.feed.view');

  return (
    <FeedIntelligenceShell>
      <AdminPageHeader
        title="খাদ্য উপাদান"
        description="VkFeedIngredient — VKL গভর্নেন্স সহ।"
        actions={
          <AdminActionButton
            href="/admin/ai-ops/feed-intelligence/ingredients/new"
            variant="primary"
          >
            নতুন উপাদান
          </AdminActionButton>
        }
      />
      <FeedIngredientList />
    </FeedIntelligenceShell>
  );
}
