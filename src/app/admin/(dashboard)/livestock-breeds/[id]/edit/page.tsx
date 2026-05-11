import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { LivestockBreedForm } from "@/components/admin/semen/LivestockBreedForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditLivestockBreedPage(props: PageProps) {
  const { id } = await props.params;
  return (
    <div className="mx-auto max-w-7xl space-y-6" lang="bn">
      <AdminPageHeader
        title="জাত সম্পাদনা"
        actions={
          <AdminActionButton href="/admin/livestock-breeds" variant="ghost">
            ← তালিকা
          </AdminActionButton>
        }
      />
      <LivestockBreedForm mode="edit" breedId={id} />
    </div>
  );
}
