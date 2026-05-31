import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedIntelligenceShell } from '@/components/admin/feed-intelligence/FeedIntelligenceShell';
import { ToxicAlertEditor } from '@/components/admin/feed-intelligence/ToxicAlertEditor';
import { ensureFeedIntelligenceAccess } from '@/lib/admin-auth/feed-intelligence-guard';

export default async function NewToxicAlertPage() {
  await ensureFeedIntelligenceAccess('ai.feed.manage');

  return (
    <FeedIntelligenceShell>
      <AdminPageHeader title="নতুন বিষাক্ত সতর্কতা" description="উচ্চ ঝুঁকি — ভেট অনুমোদন প্রয়োজন।" />
      <ToxicAlertEditor />
    </FeedIntelligenceShell>
  );
}
