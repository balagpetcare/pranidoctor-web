import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminStatCard } from "@/components/admin-ui/AdminStatCard";

import type { SmsAdminStatusSnapshot } from "@/lib/sms/service";

import { smsProviderValueBn, smsRuntimeBadges } from "./notification-sms-labels";

export function AdminSmsStatusSection({
  snapshot,
}: {
  snapshot: SmsAdminStatusSnapshot;
}) {
  const { lines, primaryBadge, extraBadges } = smsRuntimeBadges(snapshot);

  return (
    <AdminFormSection
      title="এসএমএস প্রোভাইডার"
      description="রানটাইম কনফিগারেশনের সারাংশ। গোপন মান (API কী, URL, ওটিপি) কখনো UI তে দেখানো হয় না।"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminStatCard
          title="সক্রিয় ট্রান্সপোর্ট"
          value={smsProviderValueBn(snapshot.effectiveProvider)}
          description={`NODE_ENV=${snapshot.nodeEnv}`}
        />
        <AdminStatCard
          title="কনফিগার্ড নাম"
          value={snapshot.configuredProvider || "(খালি)"}
          description={
            snapshot.effectiveProvider !== snapshot.configuredProvider
              ? "রানটাইমে ভিন্ন প্রভাইডার ব্যবহার হচ্ছে"
              : "SMS_PROVIDER / ডিফল্ট"
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AdminBadge variant={primaryBadge.variant}>{primaryBadge.label}</AdminBadge>
        {extraBadges.map((b) => (
          <AdminBadge key={b.label} variant={b.variant}>
            {b.label}
          </AdminBadge>
        ))}
      </div>

      <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
        <li>
          <span className="font-medium text-zinc-800 dark:text-zinc-200">ওটিপি</span>{" "}
          মোবাইল লগইনের SMS শুধু প্রোভাইডার দিয়ে যায়; ইন-অ্যাপ নোটিফিকেশন টেবিলে ওটিপি
          সংরক্ষিত নয়।
        </li>
      </ul>
    </AdminFormSection>
  );
}
