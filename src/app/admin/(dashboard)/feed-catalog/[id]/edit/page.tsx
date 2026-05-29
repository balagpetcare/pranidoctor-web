import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { FeedCatalogForm } from "@/components/admin/feed-catalog/FeedCatalogForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditFeedCatalogPage(props: PageProps) {
  const { id } = await props.params;
  return (
    <div className="mx-auto max-w-7xl space-y-6" lang="bn">
      <AdminPageHeader
        title="খাদ্য সম্পাদনা"
        actions={
          <AdminActionButton href="/admin/feed-catalog" variant="ghost">
            ← তালিকা
          </AdminActionButton>
        }
      />
      <FeedCatalogForm mode="edit" itemId={id} />
    </div>
  );
}
