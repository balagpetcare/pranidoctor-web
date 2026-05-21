import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CheckCircle,
  ClipboardList,
  Cpu,
  FileText,
  Stethoscope,
  Users,
  Wallet2,
  Workflow,
} from "lucide-react";

import type { AdminDashboardPageData } from "@/lib/admin/dashboard/dashboard-types";
import { AdminStatCard } from "@/components/admin-ui/AdminStatCard";

export type AdminDashboardKpiSectionProps = {
  data: AdminDashboardPageData;
};

export function AdminDashboardKpiSection({ data }: AdminDashboardKpiSectionProps) {
  const { stats, unreadNotifications } = data;

  const cards: {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
  }[] = [
    {
      title: "ডাক্তার",
      value: String(stats.totalDoctors),
      description: "নিবন্ধিত প্রোফাইল",
      icon: Stethoscope,
    },
    {
      title: "এআই টেকনিশিয়ান",
      value: String(stats.totalAiTechnicians),
      description: "নিবন্ধিত প্রোফাইল",
      icon: Cpu,
    },
    {
      title: "গ্রাহক",
      value: String(stats.totalCustomers),
      description: "কাস্টমার প্রোফাইল",
      icon: Users,
    },
    {
      title: "সেবা অনুরোধ",
      value: String(stats.totalServiceRequests),
      description: "সব স্ট্যাটাস",
      icon: ClipboardList,
    },
    {
      title: "অপেক্ষমান / চলমান",
      value: String(stats.pendingRequests),
      description: "সক্রিয় পাইপলাইন",
      icon: Workflow,
    },
    {
      title: "সম্পন্ন",
      value: String(stats.completedServiceRequests),
      description: "সম্পন্ন অনুরোধ",
      icon: CheckCircle,
    },
    {
      title: "চিকিৎসা চূড়ান্ত",
      value: String(stats.completedTreatments),
      description: "ফাইনালাইজড কেস",
      icon: FileText,
    },
    {
      title: "পরিশোধিত আয়",
      value: stats.paidRevenueDisplay,
      description: `মোট ইস্যু: ${stats.totalRevenueDisplay}`,
      icon: Wallet2,
    },
    {
      title: "অপঠিত নোটিফিকেশন",
      value: String(unreadNotifications),
      description: "আপনার অ্যাকাউন্ট",
      icon: Bell,
    },
  ];

  return (
    <section aria-labelledby="dash-kpi-heading">
      <h2
        id="dash-kpi-heading"
        className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
      >
        KPI
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <AdminStatCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}
