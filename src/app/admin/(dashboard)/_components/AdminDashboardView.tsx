import { format } from "date-fns";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CheckCircle,
  ClipboardList,
  Cpu,
  MapPin,
  Plus,
  Stethoscope,
  Users,
  Wallet2,
  Workflow,
  FileText,
} from "lucide-react";

import type { AdminDashboardPageData } from "../_lib/dashboard-stats";
import type { AdminBadgeVariant } from "@/components/admin-ui/AdminBadge";
import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin-ui/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AdminStatCard } from "@/components/admin-ui/AdminStatCard";
import { AdminTable } from "@/components/admin-ui/AdminTable";
import {
  ServiceRequestStatus,
  ServiceRequestType,
} from "@/generated/prisma/client";

function serviceRequestStatusBn(status: ServiceRequestStatus): string {
  switch (status) {
    case ServiceRequestStatus.PENDING:
      return "অপেক্ষমান";
    case ServiceRequestStatus.ACCEPTED:
      return "গৃহীত";
    case ServiceRequestStatus.ASSIGNED:
      return "বরাদ্দ";
    case ServiceRequestStatus.IN_PROGRESS:
      return "চলমান";
    case ServiceRequestStatus.COMPLETED:
      return "সম্পন্ন";
    case ServiceRequestStatus.CANCELLED:
      return "বাতিল";
    case ServiceRequestStatus.REJECTED:
      return "প্রত্যাখ্যাত";
    default:
      return status;
  }
}

function serviceRequestStatusBadgeVariant(
  status: ServiceRequestStatus,
): AdminBadgeVariant {
  switch (status) {
    case ServiceRequestStatus.COMPLETED:
      return "success";
    case ServiceRequestStatus.CANCELLED:
    case ServiceRequestStatus.REJECTED:
      return "neutral";
    case ServiceRequestStatus.PENDING:
      return "warning";
    case ServiceRequestStatus.IN_PROGRESS:
    case ServiceRequestStatus.ASSIGNED:
    case ServiceRequestStatus.ACCEPTED:
      return "info";
    default:
      return "default";
  }
}

function serviceTypeBn(t: ServiceRequestType): string {
  switch (t) {
    case ServiceRequestType.DOCTOR_HOME_VISIT:
      return "ডাক্তার হোম ভিজিট";
    case ServiceRequestType.EMERGENCY_DOCTOR:
      return "জরুরি ডাক্তার";
    case ServiceRequestType.AI_SERVICE:
      return "এআই সেবা";
    case ServiceRequestType.ONLINE_CONSULTATION_LATER:
      return "অনলাইন পরামর্শ";
    default:
      return t;
  }
}

export type AdminDashboardViewProps = Readonly<{
  data: AdminDashboardPageData;
  sessionEmail: string | null;
}>;

export function AdminDashboardView({ data, sessionEmail }: AdminDashboardViewProps) {
  const { stats, recentRequests, unreadNotifications } = data;

  return (
    <div className="space-y-10" lang="bn">
      <AdminPageHeader
        title="অপারেশন ড্যাশবোর্ড"
        description={
          <>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              প্রাণী ডাক্তার অ্যাডমিন
            </span>
            {" · "}
            সাইন ইন:{" "}
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {sessionEmail ?? "—"}
            </span>
          </>
        }
        actions={
          <>
            <AdminActionButton href="/admin/service-requests" variant="secondary">
              সব সেবা অনুরোধ
            </AdminActionButton>
            <AdminActionButton href="/admin/billing">বিলিং</AdminActionButton>
          </>
        }
      />

      {/* Summary metrics — Larkon-style KPI grid */}
      <section aria-labelledby="dash-summary-heading">
        <h2
          id="dash-summary-heading"
          className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          সারাংশ
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AdminStatCard
            title="ডাক্তার"
            value={String(stats.totalDoctors)}
            description="নিবন্ধিত ডাক্তার প্রোফাইল"
            icon={Stethoscope}
          />
          <AdminStatCard
            title="এআই টেকনিশিয়ান"
            value={String(stats.totalAiTechnicians)}
            description="নিবন্ধিত টেকনিশিয়ান প্রোফাইল"
            icon={Cpu}
          />
          <AdminStatCard
            title="কাস্টমার"
            value={String(stats.totalCustomers)}
            description="কাস্টমার প্রোফাইল"
            icon={Users}
          />
          <AdminStatCard
            title="সেবা অনুরোধ (মোট)"
            value={String(stats.totalServiceRequests)}
            description="সব অবস্থা"
            icon={ClipboardList}
          />
          <AdminStatCard
            title="অপেক্ষমান / চলমান"
            value={String(stats.pendingRequests)}
            description="জমা, বরাদ্দ বা চলমান"
            icon={Workflow}
          />
          <AdminStatCard
            title="সম্পন্ন সেবা অনুরোধ"
            value={String(stats.completedServiceRequests)}
            description="স্ট্যাটাস: সম্পন্ন"
            icon={CheckCircle}
          />
          <AdminStatCard
            title="চিকিৎসা চূড়ান্ত"
            value={String(stats.completedTreatments)}
            description="চূড়ান্ত চিকিৎসা রেকর্ড"
            icon={FileText}
          />
          <AdminStatCard
            title="বিলিং — পরিশোধিত"
            value={stats.paidRevenueDisplay}
            description={`ইস্যু ও আংশিক সহ মোট: ${stats.totalRevenueDisplay}`}
            icon={Wallet2}
          />
          <AdminStatCard
            title="নোটিফিকেশন (অপঠিত)"
            value={String(unreadNotifications)}
            description="আপনার অ্যাকাউন্টে অপঠিত বিজ্ঞপ্তি"
            icon={Bell}
          />
        </div>
      </section>

      {/* Quick actions */}
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
            href="/admin/ai-technicians/new"
            icon={Plus}
            title="নতুন টেকনিশিয়ান"
            subtitle="প্রোফাইল তৈরি"
          />
          <QuickActionCard
            href="/admin/areas/new"
            icon={MapPin}
            title="নতুন এরিয়া"
            subtitle="ভৌগোলিক ট্রি"
          />
          <QuickActionCard
            href="/admin/notifications"
            icon={Bell}
            title="নোটিফিকেশন ও SMS"
            subtitle="বিজ্ঞপ্তি প্যানেল"
          />
          <QuickActionCard
            href="/admin/billing"
            icon={Wallet2}
            title="বিলিং"
            subtitle="আদায় ও রেকর্ড"
          />
        </div>
      </section>

      {/* Recent service requests */}
      <section aria-labelledby="dash-recent-heading">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="dash-recent-heading"
            className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
          >
            সাম্প্রতিক সেবা অনুরোধ
          </h2>
          <Link
            href="/admin/service-requests"
            className="text-sm font-medium text-emerald-800 hover:underline dark:text-emerald-400"
          >
            সব দেখুন →
          </Link>
        </div>
        {recentRequests.length === 0 ? (
          <AdminEmptyState
            title="কোনো অনুরোধ নেই"
            description="এখনও কোনো সেবা অনুরোধ জমা হয়নি।"
            action={
              <AdminActionButton href="/admin/service-requests" variant="secondary">
                অনুরোধ প্যানেল
              </AdminActionButton>
            }
          />
        ) : (
          <AdminTable>
            <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">অনুরোধ</th>
                <th className="px-4 py-3">কাস্টমার</th>
                <th className="px-4 py-3">ধরন</th>
                <th className="px-4 py-3">অবস্থা</th>
                <th className="px-4 py-3 text-end">সময়</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
              {recentRequests.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/service-requests/${row.id}`}
                      className="font-mono text-xs font-medium text-emerald-800 hover:underline dark:text-emerald-400"
                    >
                      {row.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="max-w-[10rem] truncate px-4 py-3 text-zinc-800 dark:text-zinc-200">
                    {row.customerDisplayName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {serviceTypeBn(row.serviceType)}
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge variant={serviceRequestStatusBadgeVariant(row.status)}>
                      {serviceRequestStatusBn(row.status)}
                    </AdminBadge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-end text-xs text-zinc-500 dark:text-zinc-400">
                    {format(row.submittedAt, "dd/MM/yyyy HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        )}
      </section>
    </div>
  );
}

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
