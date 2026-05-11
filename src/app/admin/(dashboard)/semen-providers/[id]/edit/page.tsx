import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { SemenProviderForm } from "@/components/admin/semen/SemenProviderForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditSemenProviderPage(props: PageProps) {
  const { id } = await props.params;
  return (
    <div className="mx-auto max-w-7xl space-y-6" lang="bn">
      <AdminPageHeader
        title="প্রদানকারী সম্পাদনা"
        actions={
          <AdminActionButton href="/admin/semen-providers" variant="ghost">
            ← তালিকা
          </AdminActionButton>
        }
      />
      <SemenProviderForm mode="edit" providerId={id} />
    </div>
  );
}
