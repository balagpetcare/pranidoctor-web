import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { SemenProvidersList } from "@/components/admin/semen/SemenProvidersList";

export default function SemenProvidersPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" lang="bn">
      <AdminPageHeader
        title="সিমেন প্রদানকারী"
        description="মাস্টার তালিকা — টেমপ্লেটে লিঙ্ক করা প্রদানকারী।"
        actions={
          <AdminActionButton href="/admin/semen-providers/new" variant="primary">
            নতুন প্রদানকারী
          </AdminActionButton>
        }
      />
      <SemenProvidersList />
    </div>
  );
}
