import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { KnowledgeHubPostForm } from "@/components/admin/knowledge-hub/KnowledgeHubPostForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditKnowledgeHubPostPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl space-y-6" lang="bn">
      <AdminActionButton href={`/admin/knowledge-hub/posts/${id}`} variant="ghost">
        ← বিস্তারিত
      </AdminActionButton>
      <AdminPageHeader title="টিউটোরিয়াল সম্পাদনা" description="খসড়া বা প্রত্যাখ্যাত পোস্ট সম্পাদনা করুন।" />
      <KnowledgeHubPostForm mode="edit" postId={id} />
    </div>
  );
}
