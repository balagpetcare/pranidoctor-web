import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AreaForm } from "@/components/admin/areas/AreaForm";

export default async function EditAreaPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <div className="mx-auto flex max-w-3xl flex-col space-y-6" lang="bn">
      <AdminActionButton href="/admin/areas" variant="ghost">
        ← এলাকা তালিকা
      </AdminActionButton>
      <AdminPageHeader
        title="এলাকা সম্পাদনা"
        description="ইংরেজি বা বাংলা নাম, স্লাগ, প্যারেন্ট, সাজানোর ক্রম ও সক্রিয়তা আপডেট করুন।"
      />
      <AreaForm mode="edit" areaId={id} />
    </div>
  );
}
