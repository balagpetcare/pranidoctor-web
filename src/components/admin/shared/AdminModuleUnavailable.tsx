import Link from "next/link";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminEmptyState } from "@/components/admin-ui/AdminEmptyState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";

export type AdminModuleFeatureKey =
  | "api"
  | "table"
  | "filter"
  | "search"
  | "pagination"
  | "form"
  | "validation";

const FEATURE_LABELS: Record<AdminModuleFeatureKey, string> = {
  api: "API সংযোগ",
  table: "তালিকা (টেবিল)",
  filter: "ফিল্টার",
  search: "অনুসন্ধান",
  pagination: "পেজিনেশন",
  form: "ফর্ম (তৈরি/সম্পাদনা)",
  validation: "ভ্যালিডেশন",
};

export type AdminModuleUnavailableProps = {
  title: string;
  description: string;
  /** Expected backend route when API is missing, e.g. `GET /api/admin/customers`. */
  missingApi?: string;
  /** Features blocked until backend API exists. Defaults to all except none granted. */
  blockedFeatures?: AdminModuleFeatureKey[];
  relatedLinks?: { href: string; label: string }[];
};

const DEFAULT_BLOCKED: AdminModuleFeatureKey[] = [
  "api",
  "table",
  "filter",
  "search",
  "pagination",
  "form",
  "validation",
];

/**
 * Structured placeholder for admin modules whose backend API is not yet available.
 * Documents gaps clearly instead of a generic "coming soon" stub.
 */
export function AdminModuleUnavailable({
  title,
  description,
  missingApi,
  blockedFeatures = DEFAULT_BLOCKED,
  relatedLinks,
}: AdminModuleUnavailableProps) {
  const blocked = new Set(blockedFeatures);

  return (
    <div className="mx-auto max-w-3xl space-y-6" lang="bn">
      <AdminPageHeader title={title} description={description} />

      <AdminEmptyState
        title="ব্যাকএন্ড API প্রয়োজন"
        description={
          missingApi
            ? `এই মডিউল চালু করতে ${missingApi} এন্ডপয়েন্ট প্রয়োজন। ব্যাকএন্ড যুক্ত হলে তালিকা, ফিল্টার ও ফর্ম এখানে দেখানো হবে।`
            : "এই মডিউলের জন্য ব্যাকএন্ড API এখনো সংযুক্ত নয়।"
        }
      />

      <AdminFormSection
        title="মডিউল চেকলিস্ট"
        description="প্রতিটি বৈশিষ্ট্যের বর্তমান অবস্থা — API থাকলে সব সবুজ হবে।"
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(FEATURE_LABELS) as AdminModuleFeatureKey[]).map((key) => {
            const ok = !blocked.has(key);
            return (
              <li
                key={key}
                className="flex items-center gap-2 rounded-lg border border-[var(--pd-admin-border)] px-3 py-2 text-sm dark:border-zinc-700"
              >
                <span
                  className={
                    ok
                      ? "font-medium text-emerald-700 dark:text-emerald-400"
                      : "font-medium text-amber-700 dark:text-amber-400"
                  }
                  aria-hidden
                >
                  {ok ? "✓" : "○"}
                </span>
                <span className="text-zinc-800 dark:text-zinc-200">{FEATURE_LABELS[key]}</span>
              </li>
            );
          })}
        </ul>
      </AdminFormSection>

      {relatedLinks?.length ? (
        <AdminFormSection title="সম্পর্কিত মডিউল" description="এখনই ব্যবহারযোগ্য বিকল্প।">
          <ul className="flex flex-wrap gap-2">
            {relatedLinks.map((link) => (
              <li key={link.href}>
                <AdminActionButton href={link.href} variant="secondary">
                  {link.label}
                </AdminActionButton>
              </li>
            ))}
          </ul>
        </AdminFormSection>
      ) : null}

      {missingApi ? (
        <p className="text-xs text-[var(--pd-admin-muted)]">
          ব্যাকএন্ড টিম: <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">{missingApi}</code>
          {" · "}
          <Link href="/admin" className="underline hover:no-underline">
            ড্যাশবোর্ড
          </Link>
        </p>
      ) : null}
    </div>
  );
}
