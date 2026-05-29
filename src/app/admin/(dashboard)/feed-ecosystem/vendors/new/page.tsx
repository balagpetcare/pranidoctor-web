import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { FeedEcosystemShell } from '@/components/admin/feed-ecosystem/FeedEcosystemShell';
import { VendorForm } from '@/components/admin/feed-ecosystem/VendorForm';

export default function NewVendorPage() {
  return (
    <FeedEcosystemShell>
      <AdminPageHeader title="নতুন ভেন্ডর" description="FeedVendor তৈরি — যাচাইকরণ PENDING থেকে শুরু।" />
      <VendorForm />
    </FeedEcosystemShell>
  );
}
