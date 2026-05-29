import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedEcosystemShell } from '@/components/admin/feed-ecosystem/FeedEcosystemShell';
import { RecommendationRulesEditor } from '@/components/admin/feed-ecosystem/RecommendationRulesEditor';

export default function RecommendationRulesPage() {
  return (
    <FeedEcosystemShell>
      <AdminPageHeader title="সুপারিশ নিয়ম" description="bd-v1 ইঞ্জিন JSON — ADMIN/SUPER_ADMIN সম্পাদনা।" />
      <RecommendationRulesEditor />
    </FeedEcosystemShell>
  );
}
