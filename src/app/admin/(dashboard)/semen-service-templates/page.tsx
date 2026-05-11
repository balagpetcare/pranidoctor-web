import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { SemenServiceTemplatesList } from "@/components/admin/semen/SemenServiceTemplatesList";

export default function SemenServiceTemplatesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" lang="bn">
      <AdminPageHeader
        title="সিমেন সেবা টেমপ্লেট"
        description="অ্যাডমিন নিয়ন্ত্রিত লকড ফিল্ড — টেকনিশিয়ান শুধু মূল্য/স্টক ইত্যাদি।"
        actions={
          <AdminActionButton href="/admin/semen-service-templates/new" variant="primary">
            নতুন টেমপ্লেট
          </AdminActionButton>
        }
      />
      <SemenServiceTemplatesList />
    </div>
  );
}
