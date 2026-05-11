import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { SemenProviderForm } from "@/components/admin/semen/SemenProviderForm";

export default function NewSemenProviderPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" lang="bn">
      <AdminPageHeader
        title="নতুন সিমেন প্রদানকারী"
        actions={
          <AdminActionButton href="/admin/semen-providers" variant="ghost">
            ← তালিকা
          </AdminActionButton>
        }
      />
      <SemenProviderForm mode="create" />
    </div>
  );
}
