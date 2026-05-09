import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AdminBillingList } from "@/components/admin/billing/AdminBillingList";

export default function BillingPage() {
  return (
    <div className="space-y-6" lang="bn">
      <AdminPageHeader
        title="বিলিং"
        description="সম্পন্ন ভিজিট ও আর্থিক রেকর্ড। পেমেন্ট স্ট্যাটাস, পদ্ধতি, ডাক্তার ও তারিখ দিয়ে ফিল্টার করুন।"
        actions={
          <AdminActionButton href="/admin/settings/billing" variant="secondary">
            কমিশন সেটিংস
          </AdminActionButton>
        }
      />
      <AdminBillingList />
    </div>
  );
}
