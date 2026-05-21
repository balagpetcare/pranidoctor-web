import { USER_ROLE } from "@/lib/admin-auth/user-role";
import { ensureAdminRole } from "@/lib/admin-auth/dashboard-guard";

import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AuditAdminHub } from "@/components/admin/audit/AuditAdminHub";

export default async function AuditPage() {
  await ensureAdminRole(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN);

  return (
    <div className="mx-auto max-w-5xl space-y-6" lang="bn">
      <AdminPageHeader
        title="অডিট"
        description="OTP ডেভ লগ ও ভবিষ্যৎ authentication audit।"
      />
      <AuditAdminHub />
    </div>
  );
}
