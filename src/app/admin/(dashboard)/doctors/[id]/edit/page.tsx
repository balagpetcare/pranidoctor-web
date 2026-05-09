import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { DoctorProfileForm } from "@/components/admin/doctors/DoctorProfileForm";

export default async function EditDoctorPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <div className="mx-auto flex max-w-3xl flex-col space-y-6" lang="bn">
      <AdminActionButton href={`/admin/doctors/${id}`} variant="ghost">
        ← প্রোফাইলে ফিরুন
      </AdminActionButton>
      <AdminPageHeader
        title="ডাক্তার সম্পাদনা"
        description="যোগাযোগ, পেশাদারি ক্ষেত্র, ভিজিট ফি, জরুরি/অনলাইন, এলাকা ও বিভাগ। অনুমোদন/যাচাই/সাসপেন্ড প্রোফাইল পৃষ্ঠা থেকে।"
      />
      <DoctorProfileForm mode="edit" doctorId={id} />
    </div>
  );
}
