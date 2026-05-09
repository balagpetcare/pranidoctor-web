import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";

export default function KnowledgeHubHomePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8" lang="bn">
      <AdminPageHeader
        title="নলেজ হাব"
        description="টিউটোরিয়াল ক্যাটাগরি ও কন্টেন্ট পরিচালনা — বাংলা লেবেল, অনুমোদন ও প্রকাশ।"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminFormSection title="ক্যাটাগরি" description="টিউটোরিয়াল বিভাগের তালিকা, তৈরি ও সম্পাদনা।">
          <AdminActionButton href="/admin/knowledge-hub/categories" variant="primary">
            ক্যাটাগরি খুলুন
          </AdminActionButton>
        </AdminFormSection>
        <AdminFormSection title="টিউটোরিয়াল" description="তালিকা, ফিল্টার, অনুমোদন ও খসড়া লেখা।">
          <AdminActionButton href="/admin/knowledge-hub/posts" variant="primary">
            টিউটোরিয়াল খুলুন
          </AdminActionButton>
        </AdminFormSection>
      </div>
    </div>
  );
}
