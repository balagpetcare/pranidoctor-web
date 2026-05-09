import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { KnowledgeHubPostDetailView } from "@/components/admin/knowledge-hub/KnowledgeHubPostDetailView";

type PageProps = { params: Promise<{ id: string }> };

export default async function KnowledgeHubPostDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <AdminActionButton href="/admin/knowledge-hub/posts" variant="ghost" lang="bn">
        ← টিউটোরিয়াল তালিকা
      </AdminActionButton>
      <KnowledgeHubPostDetailView postId={id} />
    </div>
  );
}
