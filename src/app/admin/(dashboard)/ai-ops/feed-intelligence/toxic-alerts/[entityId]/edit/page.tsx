import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedIntelligenceShell } from '@/components/admin/feed-intelligence/FeedIntelligenceShell';
import { ToxicAlertEditor } from '@/components/admin/feed-intelligence/ToxicAlertEditor';
import { ensureFeedIntelligenceAccess } from '@/lib/admin-auth/feed-intelligence-guard';

type Props = { params: Promise<{ entityId: string }> };

export default async function EditToxicAlertPage({ params }: Props) {
  await ensureFeedIntelligenceAccess('ai.feed.view');
  const { entityId } = await params;

  return (
    <FeedIntelligenceShell>
      <AdminPageHeader title="সতর্কতা সম্পাদনা" description={`Entity ${entityId}`} />
      <ToxicAlertEditor entityId={entityId} />
    </FeedIntelligenceShell>
  );
}
