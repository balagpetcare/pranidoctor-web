import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { TemplateForm } from "@/components/admin/semen-template/TemplateForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditSemenServiceTemplatePage(props: PageProps) {
  const { id } = await props.params;
  return (
    <div
      className="w-full max-w-[min(100%,88rem)] space-y-4 sm:space-y-6"
      lang="bn"
    >
      <AdminPageHeader
        title="Enterprise Template Editor"
        description="Update content, pricing, breed composition, media assets, and publication workflow."
        actions={
          <>
            <AdminActionButton href={`/admin/semen-service-templates/${id}`} variant="secondary">
              বিস্তারিত
            </AdminActionButton>
            <AdminActionButton href="/admin/semen-service-templates" variant="ghost">
              ← তালিকা
            </AdminActionButton>
          </>
        }
      />
      <TemplateForm mode="edit" templateId={id} />
    </div>
  );
}
