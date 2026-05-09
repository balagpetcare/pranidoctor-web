import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { DoctorDetailPanel } from "@/components/admin/doctors/DoctorDetailPanel";

export default async function DoctorDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <div className="mx-auto flex max-w-4xl flex-col space-y-6" lang="bn">
      <AdminActionButton href="/admin/doctors" variant="ghost">
        ← ডাক্তার তালিকা
      </AdminActionButton>
      <AdminPageHeader
        title="ডাক্তার প্রোফাইল"
        description="পরিচয়, সার্ভিস এলাকা, বিভাগ ও মডারেশন কাজ।"
      />
      <DoctorDetailPanel doctorId={id} />
    </div>
  );
}
