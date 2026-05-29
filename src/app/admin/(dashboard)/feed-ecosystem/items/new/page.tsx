import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedEcosystemShell } from '@/components/admin/feed-ecosystem/FeedEcosystemShell';
import { FeedItemForm } from '@/components/admin/feed-ecosystem/FeedItemForm';

export default function NewFeedItemPage() {
  return (
    <FeedEcosystemShell>
      <AdminPageHeader title="নতুন খাদ্য আইটেম" description="Phase 4 FeedItem তৈরি করুন।" />
      <FeedItemForm mode="create" />
    </FeedEcosystemShell>
  );
}
