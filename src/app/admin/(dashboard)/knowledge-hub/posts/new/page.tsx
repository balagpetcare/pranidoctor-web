import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { KnowledgeHubPostForm } from "@/components/admin/knowledge-hub/KnowledgeHubPostForm";

export default function NewKnowledgeHubPostPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" lang="bn">
      <AdminActionButton href="/admin/knowledge-hub/posts" variant="ghost">
        ← টিউটোরিয়াল তালিকা
      </AdminActionButton>
      <AdminPageHeader title="নতুন টিউটোরিয়াল" description="অ্যাডমিন হিসেবে নতুন পোস্ট তৈরি করুন।" />
      <KnowledgeHubPostForm mode="create" />
    </div>
  );
}
