import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { FeedCatalogList } from "@/components/admin/feed-catalog/FeedCatalogList";

export default function FeedCatalogPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" lang="bn">
      <AdminPageHeader
        title="খাদ্য মাস্টার ক্যাটালগ"
        description="বাংলাদেশের গবাদি পশুর খাদ্য তালিকা — দাম ও সক্রিয়তা পরিচালনা।"
        actions={
          <AdminActionButton href="/admin/feed-catalog/new" variant="primary">
            নতুন খাদ্য
          </AdminActionButton>
        }
      />
      <FeedCatalogList />
    </div>
  );
}
