import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedEcosystemOverview } from '@/components/admin/feed-ecosystem/FeedEcosystemOverview';
import { FeedEcosystemShell } from '@/components/admin/feed-ecosystem/FeedEcosystemShell';

export default function FeedEcosystemHubPage() {
  return (
    <FeedEcosystemShell>
      <AdminPageHeader
        title="খাদ্য ও পশু ইকোসিস্টেম"
        description="Phase 4 — খাদ্য মাস্টার, ভেন্ডর, ইনভেন্টরি, অ্যানালিটিক্স ও মডারেশন।"
        actions={
          <AdminActionButton href="/admin/feed-ecosystem/items/new" variant="primary">
            নতুন খাদ্য
          </AdminActionButton>
        }
      />
      <FeedEcosystemOverview />
    </FeedEcosystemShell>
  );
}
