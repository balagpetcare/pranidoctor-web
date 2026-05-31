import Link from 'next/link';

import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedIntelligenceShell } from '@/components/admin/feed-intelligence/FeedIntelligenceShell';
import { ensureFeedIntelligenceAccess } from '@/lib/admin-auth/feed-intelligence-guard';

export default async function FeedIntelligenceOverviewPage() {
  await ensureFeedIntelligenceAccess('ai.feed.view');

  return (
    <FeedIntelligenceShell>
      <AdminPageHeader
        title="ফিড ইন্টেলিজেন্স"
        description="VKL খাদ্য জ্ঞান — উপাদান, বিষাক্ত সতর্কতা ও গভর্নেন্স।"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/ai-ops/feed-intelligence/ingredients"
          className="rounded-xl border border-violet-200 bg-violet-50/50 p-5 transition hover:border-violet-300 dark:border-violet-900 dark:bg-violet-950/30"
        >
          <h2 className="font-semibold text-violet-900 dark:text-violet-100">খাদ্য উপাদান</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            তালিকা, খসড়া, প্রকাশ, সংস্করণ ও অডিট।
          </p>
        </Link>
        <Link
          href="/admin/ai-ops/feed-intelligence/toxic-alerts"
          className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 transition hover:border-amber-300 dark:border-amber-900 dark:bg-amber-950/30"
        >
          <h2 className="font-semibold text-amber-900 dark:text-amber-100">বিষাক্ত সতর্কতা</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            ভেট অনুমোদনসহ উচ্চ-ঝুঁকি সতর্কতা পরিচালনা।
          </p>
        </Link>
      </div>
    </FeedIntelligenceShell>
  );
}
