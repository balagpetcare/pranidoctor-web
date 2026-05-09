import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { TechnicianProfileForm } from "@/components/admin/ai-technicians/TechnicianProfileForm";

export default function NewAiTechnicianPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col space-y-6" lang="bn">
      <AdminActionButton href="/admin/ai-technicians" variant="ghost">
        ← এআই টেকনিশিয়ান তালিকা
      </AdminActionButton>
      <AdminPageHeader
        title="নতুন এআই টেকনিশিয়ান"
        description="অ্যাকাউন্ট ও প্রোফাইল তৈরি। পাসওয়ার্ড বাধ্যতামূলক; সার্ভিস এলাকা ও কৃত্রিম প্রজনন সংশ্লিষ্ট সেবা বিভাগ নির্বাচন করুন।"
      />
      <TechnicianProfileForm mode="create" />
    </div>
  );
}
