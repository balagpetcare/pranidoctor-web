import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { DoctorProfileForm } from "@/components/admin/doctors/DoctorProfileForm";

export default function NewDoctorPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col space-y-6" lang="bn">
      <AdminActionButton href="/admin/doctors" variant="ghost">
        ← ডাক্তার তালিকা
      </AdminActionButton>
      <AdminPageHeader
        title="নতুন ডাক্তার"
        description="অ্যাকাউন্ট ও প্রোফাইল তৈরি। পাসওয়ার্ড বাধ্যতামূলক; এলাকা ও বিভাগ মৌলিক তথ্যের পর বরাদ্দ।"
      />
      <DoctorProfileForm mode="create" />
    </div>
  );
}
