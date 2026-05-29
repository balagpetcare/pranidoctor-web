import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedEcosystemShell } from '@/components/admin/feed-ecosystem/FeedEcosystemShell';
import { VendorDetailPanel } from '@/components/admin/feed-ecosystem/VendorDetailPanel';

type Props = { params: Promise<{ id: string }> };

export default async function VendorDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <FeedEcosystemShell>
      <AdminPageHeader title="ভেন্ডর বিস্তারিত" description="প্রোফাইল, পণ্য ও যাচাইকরণ।" />
      <VendorDetailPanel vendorId={id} />
    </FeedEcosystemShell>
  );
}
