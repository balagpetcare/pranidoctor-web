import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedEcosystemShell } from '@/components/admin/feed-ecosystem/FeedEcosystemShell';
import { ModerationQueuePanel } from '@/components/admin/feed-ecosystem/ModerationQueuePanel';

export default function ModerationPage() {
  return (
    <FeedEcosystemShell>
      <AdminPageHeader title="অনুমোদন ও মডারেশন" description="অপেক্ষমান ভেন্ডর ও নিষ্ক্রিয় খাদ্য আইটেম।" />
      <ModerationQueuePanel />
    </FeedEcosystemShell>
  );
}
