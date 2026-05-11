import { notFound } from "next/navigation";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { SemenServiceTemplateDetailView } from "@/components/admin/semen/SemenServiceTemplateDetailView";
import { adminGetSemenTemplate } from "@/lib/admin-semen/templates-service";

type PageProps = { params: Promise<{ id: string }> };

export default async function SemenServiceTemplateDetailPage(props: PageProps) {
  const { id } = await props.params;
  const template = await adminGetSemenTemplate(id);
  if (!template) notFound();

  return (
    <div className="mx-auto max-w-7xl space-y-6" lang="bn">
      <AdminPageHeader
        title={template.internalName}
        description="Enterprise read view with veterinary information architecture, media gallery, and metadata insights."
        actions={
          <>
            <AdminActionButton href={`/admin/semen-service-templates/${id}/edit`} variant="primary">
              সম্পাদনা
            </AdminActionButton>
            <AdminActionButton href="/admin/semen-service-templates" variant="ghost">
              ← তালিকা
            </AdminActionButton>
          </>
        }
      />
      <SemenServiceTemplateDetailView template={template} />
    </div>
  );
}
