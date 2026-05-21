import { AdminModuleUnavailable } from "@/components/admin/shared/AdminModuleUnavailable";

export default function AnimalsPage() {
  return (
    <AdminModuleUnavailable
      title="প্রাণীর প্রোফাইল"
      description="গ্রাহকের পোষা প্রাণীর তালিকা ও বিস্তারিত। সার্ভিস রিকোয়েস্টে প্রাণীর তথ্য আংশিকভাবে দেখা যায়।"
      missingApi="GET /api/admin/animals"
      relatedLinks={[
        { href: "/admin/service-requests", label: "সার্ভিস রিকোয়েস্ট" },
        { href: "/admin/customers", label: "ইউজার / কাস্টমার" },
      ]}
    />
  );
}
