import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { KnowledgeHubCategoryForm } from "@/components/admin/knowledge-hub/KnowledgeHubCategoryForm";

export default function NewKnowledgeHubCategoryPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" lang="bn">
      <AdminActionButton href="/admin/knowledge-hub/categories" variant="ghost">
        ← ক্যাটাগরি তালিকা
      </AdminActionButton>
      <AdminPageHeader title="নতুন ক্যাটাগরি" description="টিউটোরিয়ালের জন্য নতুন বিভাগ যোগ করুন।" />
      <KnowledgeHubCategoryForm mode="create" />
    </div>
  );
}
