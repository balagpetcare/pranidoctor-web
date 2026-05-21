import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  ClipboardList,
  MapPin,
  Plus,
  Stethoscope,
  Wallet2,
} from "lucide-react";

function QuickActionCard({
  href,
  icon: Icon,
  title,
  subtitle,
}: Readonly<{
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}>) {
  return (
    <Link
      href={href}
      className="group flex gap-3 rounded-[var(--pd-admin-radius,0.75rem)] border border-zinc-200/90 bg-[var(--pd-admin-surface)] p-4 shadow-[var(--pd-admin-card-shadow)] transition-colors hover:border-emerald-900/20 hover:bg-emerald-50/40 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-emerald-500/25 dark:hover:bg-emerald-950/20"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--pd-admin-radius-sm)] bg-zinc-100 text-zinc-700 group-hover:bg-white group-hover:text-emerald-800 dark:bg-zinc-800 dark:text-zinc-200 dark:group-hover:bg-zinc-900">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      </div>
    </Link>
  );
}

export function AdminDashboardQuickActionsSection() {
  return (
    <section aria-labelledby="dash-quick-heading">
      <h2
        id="dash-quick-heading"
        className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
      >
        দ্রুত কাজ
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          href="/admin/service-requests"
          icon={ClipboardList}
          title="সেবা অনুরোধ"
          subtitle="তালিকা ও বরাদ্দ"
        />
        <QuickActionCard
          href="/admin/doctors/new"
          icon={Plus}
          title="নতুন ডাক্তার"
          subtitle="প্রোফাইল তৈরি"
        />
        <QuickActionCard
          href="/admin/doctors"
          icon={Stethoscope}
          title="ডাক্তার তালিকা"
          subtitle="যাচাই ও স্ট্যাটাস"
        />
        <QuickActionCard
          href="/admin/areas/new"
          icon={MapPin}
          title="নতুন এরিয়া"
          subtitle="ভৌগোলিক ট্রি"
        />
        <QuickActionCard
          href="/admin/billing"
          icon={Wallet2}
          title="বিলিং"
          subtitle="আদায় ও রেকর্ড"
        />
        <QuickActionCard
          href="/admin/notifications"
          icon={Bell}
          title="নোটিফিকেশন"
          subtitle="বিজ্ঞপ্তি প্যানেল"
        />
        <QuickActionCard
          href="/admin/analytics"
          icon={BarChart3}
          title="অ্যানালিটিক্স"
          subtitle="বিস্তারিত মেট্রিক্স"
        />
        <QuickActionCard
          href="/admin/reports"
          icon={ClipboardList}
          title="চিকিৎসা রেকর্ড"
          subtitle="সম্পন্ন কেস"
        />
      </div>
    </section>
  );
}
