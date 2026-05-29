import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedEcosystemShell } from '@/components/admin/feed-ecosystem/FeedEcosystemShell';
import { FeedNutritionList } from '@/components/admin/feed-ecosystem/FeedNutritionList';

export default function FeedNutritionPage() {
  return (
    <FeedEcosystemShell>
      <AdminPageHeader title="পুষ্টি ব্যবস্থাপনা" description="CP, TDN, DM ও অন্যান্য পুষ্টি মান।" />
      <FeedNutritionList />
    </FeedEcosystemShell>
  );
}
