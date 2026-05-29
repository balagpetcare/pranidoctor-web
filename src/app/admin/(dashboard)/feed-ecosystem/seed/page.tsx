import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedEcosystemShell } from '@/components/admin/feed-ecosystem/FeedEcosystemShell';
import { SeedManagementPanel } from '@/components/admin/feed-ecosystem/SeedManagementPanel';

export default function SeedManagementPage() {
  return (
    <FeedEcosystemShell>
      <AdminPageHeader title="সিড ডেটা ব্যবস্থাপনা" description="Phase 4 feed/vendors seed — প্রিভিউ ও SUPER_ADMIN রান।" />
      <SeedManagementPanel />
    </FeedEcosystemShell>
  );
}
