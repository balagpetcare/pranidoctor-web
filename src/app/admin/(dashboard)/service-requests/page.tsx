import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { ServiceRequestsList } from "@/components/admin/service-requests/ServiceRequestsList";

export default function ServiceRequestsPage() {
  return (
    <div className="space-y-6" lang="bn">
      <AdminPageHeader
        title="সেবা অনুরোধ"
        description="গ্রাহকদের বুকিং ও অনুরোধ। স্ট্যাটাস ট্যাব ও ফিল্টার দিয়ে সরু করুন; সারি খুলে সম্পূর্ণ বিবরণ দেখুন।"
      />
      <ServiceRequestsList />
    </div>
  );
}
