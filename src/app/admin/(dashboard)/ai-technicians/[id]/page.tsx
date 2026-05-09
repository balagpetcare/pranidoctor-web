import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { TechnicianDetailPanel } from "@/components/admin/ai-technicians/TechnicianDetailPanel";

export default async function AiTechnicianDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <div className="mx-auto flex max-w-4xl flex-col space-y-6" lang="bn">
      <AdminActionButton href="/admin/ai-technicians" variant="ghost">
        ← এআই টেকনিশিয়ান তালিকা
      </AdminActionButton>
      <AdminPageHeader
        title="এআই টেকনিশিয়ান প্রোফাইল"
        description="পরিচয়, সার্ভিস এলাকা, যাচাইকরণ ও মডারেশন। অনুমোদন অপেক্ষমাণ সহ স্ট্যাটাস এখানে দেখুন।"
      />
      <TechnicianDetailPanel technicianId={id} />
    </div>
  );
}
