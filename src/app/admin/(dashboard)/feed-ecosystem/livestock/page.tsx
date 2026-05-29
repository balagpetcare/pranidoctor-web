import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedEcosystemShell } from '@/components/admin/feed-ecosystem/FeedEcosystemShell';
import { LivestockStatsPanel } from '@/components/admin/feed-ecosystem/LivestockStatsPanel';

export default function LivestockStatsPage() {
  return (
    <FeedEcosystemShell>
      <AdminPageHeader title="পশু পরিসংখ্যান" description="Livestock রেজিস্ট্রি — প্রজাতি, উদ্দেশ্য ও স্বাস্থ্য।" />
      <LivestockStatsPanel />
    </FeedEcosystemShell>
  );
}
