import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { ReportsAdminView } from "@/components/admin/reports/ReportsAdminView";

export default function ReportsPage() {
  return (
    <div className="space-y-6" lang="bn">
      <AdminPageHeader
        title="চিকিৎসা রেকর্ড"
        description="সম্পন্ন সার্ভিস রিকোয়েস্ট ও চিকিৎসা সারাংশ। আলাদা treatment-reports API নেই — ড্যাশবোর্ড + ফিল্টার করা তালিকা।"
      />
      <ReportsAdminView />
    </div>
  );
}
