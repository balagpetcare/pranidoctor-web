import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AdminNotificationsPanel } from "@/components/admin/notifications/AdminNotificationsPanel";
import { AdminSmsLogsSection } from "@/components/admin/notifications/AdminSmsLogsSection";
import { AdminSmsStatusSection } from "@/components/admin/notifications/AdminSmsStatusSection";
import { getSmsAdminStatusSnapshot } from "@/lib/sms/service";

export default function AdminNotificationsPage() {
  const smsSnapshot = getSmsAdminStatusSnapshot();

  return (
    <div className="mx-auto max-w-5xl space-y-8" lang="bn">
      <AdminPageHeader
        title="নোটিফিকেশন ও এসএমএস"
        description="ইন-অ্যাপ নোটিফিকেশন পড়া চিহ্নিত করুন। এসএমএস প্রোভাইডারের নিরাপদ সারাংশ (কোনো গোপন কী বা ওটিপি দেখানো হয় না)।"
      />
      <AdminSmsStatusSection snapshot={smsSnapshot} />
      <AdminSmsLogsSection />
      <AdminNotificationsPanel />
    </div>
  );
}
