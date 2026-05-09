import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { TechniciansList } from "@/components/admin/ai-technicians/TechniciansList";

export default function AiTechniciansPage() {
  return (
    <div className="space-y-6" lang="bn">
      <AdminPageHeader
        title="এআই টেকনিশিয়ান ব্যবস্থাপনা"
        description="কৃত্রিম প্রজনন টেকনিশিয়ান প্রোফাইল, যাচাইকরণ, অনুমোদন ও সার্ভিস এলাকা। সর্বশেষ আপডেট আগে দেখায়।"
        actions={
          <AdminActionButton href="/admin/ai-technicians/new" variant="primary">
            নতুন এআই টেকনিশিয়ান
          </AdminActionButton>
        }
      />
      <TechniciansList />
    </div>
  );
}
