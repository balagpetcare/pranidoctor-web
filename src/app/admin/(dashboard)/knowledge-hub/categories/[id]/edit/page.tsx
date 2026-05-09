import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { KnowledgeHubCategoryForm } from "@/components/admin/knowledge-hub/KnowledgeHubCategoryForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditKnowledgeHubCategoryPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl space-y-6" lang="bn">
      <AdminActionButton href="/admin/knowledge-hub/categories" variant="ghost">
        ← ক্যাটাগরি তালিকা
      </AdminActionButton>
      <AdminPageHeader title="ক্যাটাগরি সম্পাদনা" description="নাম, স্লাগ ও সক্রিয়তা আপডেট করুন।" />
      <KnowledgeHubCategoryForm mode="edit" categoryId={id} />
    </div>
  );
}
