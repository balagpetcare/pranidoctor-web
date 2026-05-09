import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { KnowledgeHubCategoriesList } from "@/components/admin/knowledge-hub/KnowledgeHubCategoriesList";

export default function KnowledgeHubCategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" lang="bn">
      <AdminPageHeader
        title="ক্যাটাগরি"
        description="নলেজ হাব ক্যাটাগরি — বাংলা নাম, স্লাগ ও সক্রিয়তা।"
        actions={
          <>
            <AdminActionButton href="/admin/knowledge-hub" variant="ghost">
              ← নলেজ হাব
            </AdminActionButton>
            <AdminActionButton href="/admin/knowledge-hub/categories/new" variant="primary">
              নতুন ক্যাটাগরি
            </AdminActionButton>
          </>
        }
      />
      <KnowledgeHubCategoriesList />
    </div>
  );
}
