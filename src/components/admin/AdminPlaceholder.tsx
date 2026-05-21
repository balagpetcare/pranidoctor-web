import { AdminModuleUnavailable } from "@/components/admin/shared/AdminModuleUnavailable";

/** @deprecated Use {@link AdminModuleUnavailable} for blocked modules. */
export type AdminPlaceholderProps = {
  title: string;
  description?: string;
  /** @deprecated Prefer `description` — same text shown under the page title. */
  subtitle?: string;
  missingApi?: string;
};

/**
 * @deprecated Use `AdminModuleUnavailable` — kept for legacy imports.
 */
export function AdminPlaceholder({
  title,
  description,
  subtitle,
  missingApi,
}: AdminPlaceholderProps) {
  return (
    <AdminModuleUnavailable
      title={title}
      description={description ?? subtitle ?? "এই বিভাগটি পরবর্তী আপডেটে সম্পূর্ণ করা হবে।"}
      missingApi={missingApi}
    />
  );
}
