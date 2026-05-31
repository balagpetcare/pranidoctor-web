import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedIngredientEditor } from '@/components/admin/feed-intelligence/FeedIngredientEditor';
import { FeedIntelligenceShell } from '@/components/admin/feed-intelligence/FeedIntelligenceShell';
import { ensureFeedIntelligenceAccess } from '@/lib/admin-auth/feed-intelligence-guard';

type Props = { params: Promise<{ entityId: string }> };

export default async function EditFeedIngredientPage({ params }: Props) {
  await ensureFeedIntelligenceAccess('ai.feed.view');
  const { entityId } = await params;

  return (
    <FeedIntelligenceShell>
      <AdminPageHeader title="উপাদান সম্পাদনা" description={`Entity ${entityId}`} />
      <FeedIngredientEditor entityId={entityId} />
    </FeedIntelligenceShell>
  );
}
