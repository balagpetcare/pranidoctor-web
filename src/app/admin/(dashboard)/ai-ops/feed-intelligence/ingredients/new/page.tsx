import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedIngredientEditor } from '@/components/admin/feed-intelligence/FeedIngredientEditor';
import { FeedIntelligenceShell } from '@/components/admin/feed-intelligence/FeedIntelligenceShell';
import { ensureFeedIntelligenceAccess } from '@/lib/admin-auth/feed-intelligence-guard';

export default async function NewFeedIngredientPage() {
  await ensureFeedIntelligenceAccess('ai.feed.manage');

  return (
    <FeedIntelligenceShell>
      <AdminPageHeader title="নতুন খাদ্য উপাদান" description="খসড়া হিসেবে VKL এন্টিটি তৈরি।" />
      <FeedIngredientEditor />
    </FeedIntelligenceShell>
  );
}
