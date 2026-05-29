import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedAnalyticsPanel } from '@/components/admin/feed-ecosystem/FeedAnalyticsPanel';
import { FeedEcosystemShell } from '@/components/admin/feed-ecosystem/FeedEcosystemShell';

export default function FeedAnalyticsPage() {
  return (
    <FeedEcosystemShell>
      <AdminPageHeader title="খাদ্য অ্যানালিটিক্স" description="ব্যবহার, ক্রয় ও সুপারিশ লগ — প্ল্যাটফর্ম সারাংশ।" />
      <FeedAnalyticsPanel />
    </FeedEcosystemShell>
  );
}
