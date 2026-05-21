import Link from "next/link";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminModuleUnavailable } from "@/components/admin/shared/AdminModuleUnavailable";

export function AuditAdminHub() {
  return (
    <div className="space-y-8">
      <AdminFormSection
        title="OTP ডেভ লগ"
        description="SUPER_ADMIN / ADMIN only. পূর্ণ OTP প্যানেল আলাদা পৃষ্ঠায়।"
      >
        <p className="mb-3 text-sm text-[var(--pd-admin-muted)]">
          ডেভ/স্টেজিং OTP প্লেইনটেক্সট (প্রোডে env-gated)।
        </p>
        <AdminActionButton href="/admin/dev-tools/otp-logs" variant="primary">
          OTP লগ খুলুন
        </AdminActionButton>
      </AdminFormSection>

      <AdminFormSection
        title="অথেন্টিকেশন অডিট"
        description="লগইন/লগআউট/সেশন ইভেন্ট — ব্যাকএন্ড `auth-audit.service.ts` আছে কিন্তু admin API/UI নেই।"
      >
        <AdminModuleUnavailable
          title="অথেন্টিকেশন অডিট"
          description="সেশন ও লগইন ইভেন্টের তালিকা।"
          missingApi="GET /api/admin/audit/auth"
          blockedFeatures={["api", "table", "filter", "search", "pagination"]}
          relatedLinks={[
            { href: "/admin/dev-tools/otp-logs", label: "OTP লগ" },
            { href: "/admin/notifications", label: "নোটিফিকেশন" },
          ]}
        />
      </AdminFormSection>

      <AdminFormSection title="অন্যান্য" description="সম্পর্কিত ডায়াগনস্টিক।">
        <Link
          href="/admin/notifications"
          className="text-sm text-emerald-700 underline hover:no-underline dark:text-emerald-400"
        >
          নোটিফিকেশন
        </Link>
      </AdminFormSection>
    </div>
  );
}

/** Standalone blocked audit when only auth-audit section needed */
export function AuthAuditUnavailable() {
  return (
    <AdminModuleUnavailable
      title="অথেন্টিকেশন অডিট"
      description="সেশন ও লগইন ইভেন্টের তালিকা।"
      missingApi="GET /api/admin/audit/auth"
      relatedLinks={[
        { href: "/admin/audit", label: "অডিট হাব" },
        { href: "/admin/dev-tools/otp-logs", label: "OTP লগ" },
      ]}
    />
  );
}
