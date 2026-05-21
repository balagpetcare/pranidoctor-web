import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { RolesAdminPanel } from "@/components/admin/settings/RolesAdminPanel";

export default function SettingsRolesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6" lang="bn">
      <AdminPageHeader
        title="ভূমিকা"
        description="অ্যাডমিন প্যানেলে সাইন-ইনযোগ্য ভূমিকা ও এন্টারপ্রাইজ capability ম্যাট্রিক্স (read-only)।"
      />
      <RolesAdminPanel />
    </div>
  );
}
