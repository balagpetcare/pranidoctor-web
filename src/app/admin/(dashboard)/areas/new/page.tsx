import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AreaForm } from "@/components/admin/areas/AreaForm";

export default function NewAreaPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col space-y-6" lang="bn">
      <AdminActionButton href="/admin/areas" variant="ghost">
        ← এলাকা তালিকা
      </AdminActionButton>
      <AdminPageHeader
        title="নতুন এলাকা"
        description="বিভাগ, জেলা, উপজেলা, ইউনিয়ন, গ্রাম বা সার্ভিস এরিয়া যোগ করুন। প্যারেন্ট স্তরের বিধি মেনে চলুন।"
      />
      <AreaForm mode="create" />
    </div>
  );
}
