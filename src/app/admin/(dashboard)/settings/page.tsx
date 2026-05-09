import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8" lang="bn">
      <AdminPageHeader
        title="সেটিংস"
        description="প্রাণী ডাক্তার অ্যাডমিন প্যানেলের কার্যকরী কনফিগারেশন। বিলিং ও কমিশন হার এখান থেকে খুলুন।"
      />
      <AdminFormSection
        title="বিলিং ও কমিশন"
        description="প্ল্যাটফর্ম কমিশন হার (০–১০০%) দেখুন ও সম্পাদনা করুন।"
      >
        <AdminActionButton href="/admin/settings/billing" variant="primary">
          বিলিং সেটিংস খুলুন
        </AdminActionButton>
      </AdminFormSection>
    </div>
  );
}
