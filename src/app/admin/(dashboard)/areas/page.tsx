import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AreasList } from "@/components/admin/areas/AreasList";

export default function AreasPage() {
  return (
    <div className="space-y-6" lang="bn">
      <AdminPageHeader
        title="এলাকা ব্যবস্থাপনা"
        description="বাংলাদেশ ভৌগোলিক ট্রি — সেবা মেলানোর জন্য। বিভাগ, জেলা, উপজেলা, ইউনিয়ন, গ্রাম ও সার্ভিস এরিয়া। ইংরেজি লেবেল ফর্মে; বাংলা নাম প্রতি সারিতে সংরক্ষিত।"
        actions={
          <AdminActionButton href="/admin/areas/new" variant="primary">
            নতুন এলাকা
          </AdminActionButton>
        }
      />
      <AreasList />
    </div>
  );
}
