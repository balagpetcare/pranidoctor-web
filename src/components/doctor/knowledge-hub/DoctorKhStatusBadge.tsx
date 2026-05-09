"use client";

import { cn } from "@/lib/cn";

const LABELS: Record<string, { bn: string; en: string }> = {
  DRAFT: { bn: "খসড়া", en: "Draft" },
  PENDING_REVIEW: { bn: "পর্যালোচনাধীন", en: "Pending review" },
  APPROVED: { bn: "অনুমোদিত", en: "Approved" },
  REJECTED: { bn: "প্রত্যাখ্যাত", en: "Rejected" },
};

export function DoctorKhStatusBadge({
  status,
}: {
  status: keyof typeof LABELS;
}) {
  const cfg = LABELS[status] ?? { bn: status, en: status };
  const color = cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
    status === "DRAFT" &&
      "bg-zinc-100 text-zinc-800 ring-zinc-400/30 dark:bg-zinc-800 dark:text-zinc-200",
    status === "PENDING_REVIEW" &&
      "bg-amber-100 text-amber-950 ring-amber-500/30 dark:bg-amber-950/50 dark:text-amber-100",
    status === "APPROVED" &&
      "bg-teal-100 text-teal-950 ring-teal-600/30 dark:bg-teal-950/40 dark:text-teal-50",
    status === "REJECTED" &&
      "bg-rose-100 text-rose-950 ring-rose-500/30 dark:bg-rose-950/40 dark:text-rose-50",
  );

  return (
    <span className={color} title={cfg.en} lang="bn">
      {cfg.bn}
    </span>
  );
}
