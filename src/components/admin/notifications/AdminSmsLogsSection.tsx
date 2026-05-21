import { AdminEmptyState } from "@/components/admin-ui/AdminEmptyState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";

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
      <AdminEmptyState
        title="কোনো সংরক্ষিত এসএমএস লগ নেই"
        description="পরবর্তীতে GET /api/admin/sms/logs API থাকলে পাঠানো হয়েছে / ব্যর্থ / অপেক্ষমাণ স্ট্যাটাস দেখানো হবে।"
      />
    </AdminFormSection>
  );
}
