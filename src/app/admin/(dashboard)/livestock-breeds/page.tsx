import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { LivestockBreedsList } from "@/components/admin/semen/LivestockBreedsList";

export default function LivestockBreedsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" lang="bn">
      <AdminPageHeader
        title="পশুর জাত"
        description="সিমেন টেমপ্লেটের জাত মিশ্রণে ব্যবহৃত মাস্টার।"
        actions={
          <AdminActionButton href="/admin/livestock-breeds/new" variant="primary">
            নতুন জাত
          </AdminActionButton>
        }
      />
      <LivestockBreedsList />
    </div>
  );
}
