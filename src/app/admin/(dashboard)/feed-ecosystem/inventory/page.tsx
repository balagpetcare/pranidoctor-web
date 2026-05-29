import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedEcosystemShell } from '@/components/admin/feed-ecosystem/FeedEcosystemShell';
import { InventoryMonitorList } from '@/components/admin/feed-ecosystem/InventoryMonitorList';

export default function InventoryMonitorPage() {
  return (
    <FeedEcosystemShell>
      <AdminPageHeader title="ইনভেন্টরি মনিটরিং" description="প্ল্যাটফর্ম জুড়ে FeedInventory ও কম-স্টক সতর্কতা।" />
      <InventoryMonitorList />
    </FeedEcosystemShell>
  );
}
