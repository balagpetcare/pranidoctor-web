import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import {
  getLocationAdminStats,
  readLocationImportReport,
} from "@/lib/locations/location-master-admin-client";

type ImportReportShape = {
  generatedAt?: string;
  dryRun?: boolean;
  summary?: {
    missingParent?: number;
    invalidCoordinate?: number;
    pendingVerificationApprox?: number;
    duplicateWarningsTotal?: number;
    missingCoordinatesInDb?: number | null;
  };
  unions?: { imported?: number; updated?: number; invalid?: number };
  villages?: { imported?: number; updated?: number; invalid?: number };
};

export default async function AdminLocationsPage() {
  const stats = await getLocationAdminStats();
  const rawReport = readLocationImportReport();
  const report = rawReport as ImportReportShape | null;

  const dup =
    stats.duplicateWarningCounts.divisions +
    stats.duplicateWarningCounts.districts +
    stats.duplicateWarningCounts.upazilas +
    stats.duplicateWarningCounts.unions +
    stats.duplicateWarningCounts.unionVillageNamePairs;

  const miss =
    stats.missingCoordinates.divisions +
    stats.missingCoordinates.districts +
    stats.missingCoordinates.upazilas +
    stats.missingCoordinates.unions +
    stats.missingCoordinates.villages;

  const pend =
    stats.pendingVerification.divisions +
    stats.pendingVerification.districts +
    stats.pendingVerification.upazilas +
    stats.pendingVerification.unions +
    stats.pendingVerification.villages;

  const totalActive =
    stats.counts.divisions +
    stats.counts.districts +
    stats.counts.upazilas +
    stats.counts.unions +
    stats.counts.villages;

  return (
    <div className="space-y-6" lang="bn">
      <AdminPageHeader
        title="লোকেশন মাস্টার"
        description="বিভাগ–জেলা–উপজেলা–ইউনিয়ন–গ্রাম CSV ইমপোর্ট, ভেরিফিকেশন ও কোঅর্ডিনেট ট্র্যাকিং। অফিসিয়াল ডেটা ছাড়া গ্রাম/ইউনিয়ন তালিকা যোগ করা যাবে না।"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="মোট সক্রিয় রেকর্ড (সব স্তর)" value={String(totalActive)} />
        <StatCard title="কোঅর্ডিনেট বিহীন (সব স্তর)" value={String(miss)} />
        <StatCard title="অনিরীক্ষিত (সব স্তর)" value={String(pend)} />
        <StatCard title="সম্ভাব্য ডুপ্লিকেট গ্রুপ" value={String(dup)} hint="কোড/নাম ভিত্তিক হিউরিস্টিক" />
        <StatCard title="শেষ ইমপোর্ট" value={report?.generatedAt ? new Date(report.generatedAt).toLocaleString() : "—"} />
        <StatCard
          title="শেষ রান (ইউনিয়ন/গ্রাম)"
          value={
            report
              ? `ই ${report.unions?.imported ?? 0}/${report.unions?.updated ?? 0} · গ ${report.villages?.imported ?? 0}/${report.villages?.updated ?? 0}`
              : "—"
          }
        />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link className="text-blue-600 underline" href="/admin/locations/missing-coords">
          কোঅর্ডিনেট অনুপস্থিত তালিকা
        </Link>
        <span className="text-neutral-400">|</span>
        <Link className="text-blue-600 underline" href="/admin/locations/pending-verification">
          অনিরীক্ষিত তালিকা
        </Link>
      </div>

      <p className="text-sm text-neutral-600">
        API: <code className="rounded bg-neutral-100 px-1">/api/admin/locations/stats</code>,{" "}
        <code className="rounded bg-neutral-100 px-1">missing-coords</code>,{" "}
        <code className="rounded bg-neutral-100 px-1">pending-verification</code>,{" "}
        <code className="rounded bg-neutral-100 px-1">duplicates</code>,{" "}
        <code className="rounded bg-neutral-100 px-1">import-report</code>
      </p>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-neutral-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}
