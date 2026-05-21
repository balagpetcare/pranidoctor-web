import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AnalyticsAdminView } from "@/components/admin/analytics/AnalyticsAdminView";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6" lang="bn">
      <AdminPageHeader
        title="অ্যানালিটিক্স"
        description="প্ল্যাটফর্ম মেট্রিক্স ও আয় — ড্যাশবোর্ড API পুনঃব্যবহার।"
      />
      <AnalyticsAdminView />
    </div>
  );
}
