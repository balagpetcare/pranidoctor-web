import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { TemplateForm } from "@/components/admin/semen-template/TemplateForm";

export default function NewSemenServiceTemplatePage() {
  return (
    <div
      className="w-full max-w-[min(100%,88rem)] space-y-4 sm:space-y-6"
      lang="bn"
    >
      <AdminPageHeader
        title="Enterprise Template Studio"
        description="Create a premium semen service template with structured workflow, validation tracking, and publish controls."
        actions={
          <AdminActionButton href="/admin/semen-service-templates" variant="ghost">
            ← তালিকা
          </AdminActionButton>
        }
      />
      <TemplateForm mode="create" />
    </div>
  );
}
