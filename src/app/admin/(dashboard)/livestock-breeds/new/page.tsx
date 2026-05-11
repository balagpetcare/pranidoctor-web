import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { LivestockBreedForm } from "@/components/admin/semen/LivestockBreedForm";

export default function NewLivestockBreedPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" lang="bn">
      <AdminPageHeader
        title="নতুন জাত"
        actions={
          <AdminActionButton href="/admin/livestock-breeds" variant="ghost">
            ← তালিকা
          </AdminActionButton>
        }
      />
      <LivestockBreedForm mode="create" />
    </div>
  );
}
