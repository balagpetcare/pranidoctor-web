import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { KnowledgeHubPostsList } from "@/components/admin/knowledge-hub/KnowledgeHubPostsList";

export default function KnowledgeHubPostsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" lang="bn">
      <AdminPageHeader
        title="টিউটোরিয়াল"
        description="সব লেখকের খসড়া ও ডাক্তারদের জমাকৃত পোস্ট — অনুমোদন এখান থেকে।"
        actions={
          <>
            <AdminActionButton href="/admin/knowledge-hub" variant="ghost">
              ← নলেজ হাব
            </AdminActionButton>
            <AdminActionButton href="/admin/knowledge-hub/posts/new" variant="primary">
              নতুন পোস্ট (অ্যাডমিন)
            </AdminActionButton>
          </>
        }
      />
      <KnowledgeHubPostsList />
    </div>
  );
}
