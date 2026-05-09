import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AdminBillingDetail } from "@/components/admin/billing/AdminBillingDetail";

export default function BillingDetailPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col space-y-6" lang="bn">
      <AdminActionButton href="/admin/billing" variant="ghost">
        ← বিলিং তালিকা
      </AdminActionButton>
      <AdminPageHeader
        title="বিলিং বিস্তারিত"
        description="সার্ভিস ফি, যাতায়াত ও ওষুধ, ডিসকাউন্ট, মোট আদায়, প্ল্যাটফর্ম কমিশন ও প্রোভাইডার পেআউট।"
      />
      <AdminBillingDetail />
    </div>
  );
}
