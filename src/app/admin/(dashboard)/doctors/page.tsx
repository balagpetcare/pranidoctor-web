import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { DoctorsList } from "@/components/admin/doctors/DoctorsList";

export default function DoctorsPage() {
  return (
    <div className="space-y-6" lang="bn">
      <AdminPageHeader
        title="ডাক্তার ব্যবস্থাপনা"
        description="পশুচিকিৎসক প্রোফাইল, যাচাই, অনুমোদন ও সার্ভিস এলাকা। সর্বশেষ আপডেট আগে দেখায়।"
        actions={
          <AdminActionButton href="/admin/doctors/new" variant="primary">
            নতুন ডাক্তার
          </AdminActionButton>
        }
      />
      <DoctorsList />
    </div>
  );
}
