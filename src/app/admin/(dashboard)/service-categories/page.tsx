import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { ServiceCategoriesList } from "@/components/admin/service-categories/ServiceCategoriesList";

export default function ServiceCategoriesPage() {
  return (
    <div className="space-y-6" lang="bn">
      <AdminPageHeader
        title="সার্ভিস ক্যাটাগরি"
        description="ডাক্তার ও এআই টেকনিশিয়ান প্রোফাইলে ব্যবহৃত মাস্টার ক্যাটাগরি। পঠন-মাত্র তালিকা।"
      />
      <ServiceCategoriesList />
    </div>
  );
}
