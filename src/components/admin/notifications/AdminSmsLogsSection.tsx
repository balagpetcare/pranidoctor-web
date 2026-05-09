import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminTable } from "@/components/admin-ui/AdminTable";

/**
 * SMS delivery is not persisted in Prisma today. Table headers document the intended future shape;
 * the body explains current behaviour (local logger / HTTP provider — no secret values).
 */
export function AdminSmsLogsSection() {
  return (
    <AdminFormSection
      title="এসএমএস লগ"
      description="প্রতিটি বার্তার ডেলিভারি স্ট্যাটাস ডাটাবেসে সংরক্ষিত নয়। লোকাল প্রোভাইডার সার্ভার কনসোলে লগ করে; HTTP প্রোভাইডারে ত্রুটি কনসোলে দেখা যেতে পারে।"
    >
      <AdminTable>
        <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
          <tr>
            <th className="px-3 py-3">সময়</th>
            <th className="px-3 py-3">ধরন</th>
            <th className="px-3 py-3">ডেলিভারি</th>
            <th className="px-3 py-3">ত্রুটি</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
          <tr>
            <td colSpan={4} className="px-4 py-10 text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              কোনো সংরক্ষিত এসএমএস লগ নেই। পরবর্তীতে API থাকলে এখানে{" "}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">পাঠানো হয়েছে</span> /{" "}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">ব্যর্থ</span> /{" "}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">অপেক্ষমাণ</span> স্ট্যাটাস দেখানো
              হবে।
            </td>
          </tr>
        </tbody>
      </AdminTable>
    </AdminFormSection>
  );
}
