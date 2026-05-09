import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { TechnicianProfileForm } from "@/components/admin/ai-technicians/TechnicianProfileForm";

export default async function EditAiTechnicianPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <div className="mx-auto flex max-w-3xl flex-col space-y-6" lang="bn">
      <AdminActionButton href={`/admin/ai-technicians/${id}`} variant="ghost">
        ← প্রোফাইলে ফিরুন
      </AdminActionButton>
      <AdminPageHeader
        title="এআই টেকনিশিয়ান সম্পাদনা"
        description="যোগাযোগ, সেবা ফি, জরুরি মাঠ সেবা, অ্যাকাউন্ট স্ট্যাটাস, সার্ভিস এলাকা ও সেবা বিভাগ। অনুমোদন/যাচাই/সাসপেন্ড প্রোফাইল পৃষ্ঠা থেকে।"
      />
      <TechnicianProfileForm mode="edit" technicianId={id} />
    </div>
  );
}
