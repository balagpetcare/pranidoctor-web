import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedEcosystemShell } from '@/components/admin/feed-ecosystem/FeedEcosystemShell';
import { FeedItemForm } from '@/components/admin/feed-ecosystem/FeedItemForm';

type Props = { params: Promise<{ id: string }> };

export default async function EditFeedItemPage({ params }: Props) {
  const { id } = await params;
  return (
    <FeedEcosystemShell>
      <AdminPageHeader title="খাদ্য সম্পাদনা" description="FeedItem ও পুষ্টি তথ্য আপডেট।" />
      <FeedItemForm mode="edit" itemId={id} />
    </FeedEcosystemShell>
  );
}
