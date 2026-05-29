import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedCategoryMetaList } from '@/components/admin/feed-ecosystem/FeedCategoryMetaList';
import { FeedEcosystemShell } from '@/components/admin/feed-ecosystem/FeedEcosystemShell';

export default function FeedCategoriesPage() {
  return (
    <FeedEcosystemShell>
      <AdminPageHeader
        title="খাদ্য ক্যাটাগরি"
        description="FeedCategory enum-এর বাংলা/ইংরেজি লেবেল ও বর্ণনা সম্পাদনা।"
      />
      <FeedCategoryMetaList />
    </FeedEcosystemShell>
  );
}
