import { AdminModuleUnavailable } from "@/components/admin/shared/AdminModuleUnavailable";

export default function PrescriptionsPage() {
  return (
    <AdminModuleUnavailable
      title="প্রেসক্রিপশন"
      description="চিকিৎসা প্রেসক্রিপশন তালিকা, PDF ও সম্পাদনা।"
      missingApi="GET /api/admin/prescriptions"
      relatedLinks={[
        { href: "/admin/reports", label: "চিকিৎসা রেকর্ড" },
        { href: "/admin/service-requests", label: "সার্ভিস রিকোয়েস্ট" },
      ]}
    />
  );
}
