import { USER_ROLE } from "@/lib/admin-auth/user-role";
import { ensureAdminRole } from "@/lib/admin-auth/dashboard-guard";

import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AdminOtpDevLogsPanel } from "@/components/admin/dev-tools/AdminOtpDevLogsPanel";
import {
  getOtpConfig,
  isOtpDebugPanelAllowed,
} from "@/lib/mobile-auth/otp-env";

export default async function AdminOtpDevLogsPage() {
  await ensureAdminRole(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN);

  const allowed = isOtpDebugPanelAllowed();
  const cfg = getOtpConfig();

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl space-y-4" lang="bn">
        <AdminPageHeader
          title="OTP ডিবাগ লগ"
          description="প্রোডাকশনে এই পৃষ্ঠা বন্ধ থাকে, যদি না OTP_DEBUG_PANEL_ENABLED=true সেট করা থাকে।"
        />
        <p className="rounded-lg border border-[var(--pd-admin-border)] bg-[var(--pd-admin-surface)] p-4 text-sm">
          অ্যাক্সেস নেই। NODE_ENV=production হলে .env এ OTP_DEBUG_PANEL_ENABLED=true
          যোগ করুন (সতর্কতার সাথে)।
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6" lang="bn">
      <AdminPageHeader
        title="OTP ডিবাগ লগ"
        description={
          cfg.mode === "dev"
            ? "ডেভ মোডে পাঠানো OTP এখানে দেখা যেতে পারে (প্রোডাকশন বিল্ডে কোড লুকানো)। টার্মিনাল লগও দেখুন।"
            : "লাইভ মোডে এখানে কোনো প্লেইন OTP সংরক্ষণ করা হয় নি। শুধু ডেভ মোডের চেষ্টা এখানে থাকে।"
        }
      />
      <AdminOtpDevLogsPanel />
    </div>
  );
}
