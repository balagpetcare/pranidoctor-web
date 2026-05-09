import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { ServiceRequestDetailPanel } from "@/components/admin/service-requests/ServiceRequestDetailPanel";

export default async function ServiceRequestDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <div className="mx-auto flex max-w-4xl flex-col space-y-6" lang="bn">
      <AdminActionButton href="/admin/service-requests" variant="ghost">
        ← সেবা অনুরোধ তালিকা
      </AdminActionButton>
      <AdminPageHeader
        title="সেবা অনুরোধ বিস্তারিত"
        description={
          <>
            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
              {id}
            </span>
            <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
              গ্রাহক, পশু, সময়সূচি ও প্রদানকারী বরাদ্দ।
            </span>
          </>
        }
      />
      <ServiceRequestDetailPanel requestId={id} />
    </div>
  );
}
