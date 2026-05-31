import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedIntelligenceShell } from '@/components/admin/feed-intelligence/FeedIntelligenceShell';
import { ToxicAlertList } from '@/components/admin/feed-intelligence/ToxicAlertList';
import { ensureFeedIntelligenceAccess } from '@/lib/admin-auth/feed-intelligence-guard';

export default async function ToxicAlertsPage() {
  await ensureFeedIntelligenceAccess('ai.feed.view');

  return (
    <FeedIntelligenceShell>
      <AdminPageHeader
        title="বিষাক্ত খাদ্য সতর্কতা"
        description="VkToxicFeedAlert — ভেট অনুমোদন বাধ্যতামূলক।"
        actions={
          <AdminActionButton
            href="/admin/ai-ops/feed-intelligence/toxic-alerts/new"
            variant="primary"
          >
            নতুন সতর্কতা
          </AdminActionButton>
        }
      />
      <ToxicAlertList />
    </FeedIntelligenceShell>
  );
}
