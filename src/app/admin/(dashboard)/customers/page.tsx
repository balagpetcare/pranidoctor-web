import { AdminModuleUnavailable } from "@/components/admin/shared/AdminModuleUnavailable";

export default function CustomersPage() {
  return (
    <AdminModuleUnavailable
      title="ইউজার / কাস্টমার"
      description="গ্রাহক (CUSTOMER role) তালিকা, প্রোফাইল ও সার্চ। ড্যাশবোর্ডে গ্রাহক সংখ্যা API থেকে আসে; তালিকা API নেই।"
      missingApi="GET /api/admin/customers"
      relatedLinks={[
        { href: "/admin/service-requests", label: "সার্ভিস রিকোয়েস্ট" },
        { href: "/admin", label: "ড্যাশবোর্ড" },
      ]}
    />
  );
}
