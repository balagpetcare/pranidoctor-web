import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { FeedCatalogForm } from "@/components/admin/feed-catalog/FeedCatalogForm";

export default function NewFeedCatalogPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" lang="bn">
      <AdminPageHeader
        title="নতুন খাদ্য"
        actions={
          <AdminActionButton href="/admin/feed-catalog" variant="ghost">
            ← তালিকা
          </AdminActionButton>
        }
      />
      <FeedCatalogForm mode="create" />
    </div>
  );
}
