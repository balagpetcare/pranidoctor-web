import { AdminModuleUnavailable } from "@/components/admin/shared/AdminModuleUnavailable";

export default function UsersPage() {
  return (
    <AdminModuleUnavailable
      title="ইউজার"
      description="সিস্টেম ইউজার ও গ্রাহক (CUSTOMER) তালিকা। `/admin/customers` এর সমতুল্য রুট।"
      missingApi="GET /api/admin/users"
      relatedLinks={[
        { href: "/admin/customers", label: "কাস্টমার (একই মডিউল)" },
        { href: "/admin/doctors", label: "ডাক্তার" },
        { href: "/admin", label: "ড্যাশবোর্ড" },
      ]}
    />
  );
}
