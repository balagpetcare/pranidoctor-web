import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { PermissionsAdminPanel } from "@/components/admin/settings/PermissionsAdminPanel";

export default function SettingsPermissionsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6" lang="bn">
      <AdminPageHeader
        title="অনুমতি"
        description="এন্টারপ্রাইজ review capabilities ও UI গেট — `src/lib/admin-auth/permissions.ts`।"
      />
      <PermissionsAdminPanel />
    </div>
  );
}
