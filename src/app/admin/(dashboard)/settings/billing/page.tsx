import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AdminBillingSettingsForm } from "@/components/admin/billing/AdminBillingSettingsForm";

export default function AdminBillingSettingsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col space-y-6" lang="bn">
      <AdminActionButton href="/admin/settings" variant="ghost">
        ← সেটিংস
      </AdminActionButton>
      <AdminPageHeader
        title="বিলিং ও কমিশন"
        description="প্ল্যাটফর্ম কমিশন হার কনফিগার করুন। কমিশন মূলত সার্ভিস ফি ভিত্তিতে প্রয়োগ হয় (ওষুধ/যাতায়াত বাদ)।"
      />
      <AdminBillingSettingsForm />
    </div>
  );
}
