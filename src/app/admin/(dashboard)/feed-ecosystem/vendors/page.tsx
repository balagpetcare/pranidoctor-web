import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedEcosystemShell } from '@/components/admin/feed-ecosystem/FeedEcosystemShell';
import { VendorList } from '@/components/admin/feed-ecosystem/VendorList';

export default function VendorsPage() {
  return (
    <FeedEcosystemShell>
      <AdminPageHeader
        title="ভেন্ডর ব্যবস্থাপনা"
        description="খাদ্য বিক্রেতা তালিকা, যাচাইকরণ ও পণ্য।"
        actions={
          <AdminActionButton href="/admin/feed-ecosystem/vendors/new" variant="primary">
            নতুন ভেন্ডর
          </AdminActionButton>
        }
      />
      <VendorList />
    </FeedEcosystemShell>
  );
}
