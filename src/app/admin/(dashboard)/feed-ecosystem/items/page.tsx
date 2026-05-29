import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedEcosystemShell } from '@/components/admin/feed-ecosystem/FeedEcosystemShell';
import { FeedItemList } from '@/components/admin/feed-ecosystem/FeedItemList';

export default function FeedEcosystemItemsPage() {
  return (
    <FeedEcosystemShell>
      <AdminPageHeader
        title="খাদ্য আইটেম"
        description="Phase 4 FeedItem মাস্টার — কোড, বিভাগ, দাম ও পুষ্টি।"
        actions={
          <AdminActionButton href="/admin/feed-ecosystem/items/new" variant="primary">
            নতুন আইটেম
          </AdminActionButton>
        }
      />
      <FeedItemList />
    </FeedEcosystemShell>
  );
}
