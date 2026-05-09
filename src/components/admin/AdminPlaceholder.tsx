import { AdminEmptyState } from "@/components/admin-ui/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";

const DEFAULT_DESCRIPTION =
  "এই বিভাগটি পরবর্তী আপডেটে সম্পূর্ণ করা হবে। API ও তালিকা প্রস্তুত হলে এখানে কাজ দেখাবে।";

export type AdminPlaceholderProps = {
  title: string;
  description?: string;
  /** @deprecated Prefer `description` — same text shown under the page title. */
  subtitle?: string;
};

/**
 * Stub route content — uses the same page chrome as migrated admin pages
 * (`AdminPageHeader` + `AdminEmptyState`).
 */
export function AdminPlaceholder({ title, description, subtitle }: AdminPlaceholderProps) {
  const resolvedDescription = description ?? subtitle ?? DEFAULT_DESCRIPTION;

  return (
    <div className="mx-auto max-w-3xl space-y-6" lang="bn">
      <AdminPageHeader title={title} description={resolvedDescription} />
      <AdminEmptyState
        title="শীঘ্রই আসছে"
        description="এখনো তালিকা বা ফর্ম সংযুক্ত নয়। ড্যাশবোর্ড বা অন্য সক্রিয় মডিউল ব্যবহার করুন।"
      />
    </div>
  );
}
