import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8" lang="bn">
      <AdminPageHeader
        title="সেটিংস"
        description="প্রাণী ডাক্তার অ্যাডমিন প্যানেলের কনফিগারেশন, অ্যাক্সেস ও বিলিং।"
      />

      <AdminFormSection
        title="Legal & privacy"
        description="Privacy policy versions, in-app summaries, and consent audit."
      >
        <AdminActionButton href="/admin/settings/legal" variant="primary">
          Legal settings
        </AdminActionButton>
      </AdminFormSection>

      <AdminFormSection
        title="Legal & AI disclaimer"
        description="Privacy/terms URLs, AI disclaimer tiers, consent versioning."
      >
        <div className="flex flex-wrap gap-2">
          <AdminActionButton href="/admin/settings/ai-disclaimer" variant="primary">
            AI Disclaimer
          </AdminActionButton>
          <AdminActionButton href="/admin/settings/vet-disclaimer" variant="primary">
            Veterinary Disclaimer
          </AdminActionButton>
          <AdminActionButton href="/admin/settings/ai-escalation-disclosure" variant="primary">
            AI Escalation Disclosure
          </AdminActionButton>
          <AdminActionButton href="/admin/settings/emergency-limitation" variant="primary">
            Emergency Limitation Notice
          </AdminActionButton>
          <AdminActionButton href="/admin/settings/ai-compliance" variant="primary">
            AI Compliance Rules
          </AdminActionButton>
        </div>
      </AdminFormSection>

      <AdminFormSection
        title="বিলিং ও কমিশন"
        description="প্ল্যাটফর্ম কমিশন হার (০–১০০%) দেখুন ও সম্পাদনা করুন।"
      >
        <AdminActionButton href="/admin/settings/billing" variant="primary">
          বিলিং সেটিংস খুলুন
        </AdminActionButton>
      </AdminFormSection>

      <AdminFormSection
        title="ভূমিকা ও অনুমতি"
        description="অ্যাডমিন ভূমিকা (SUPER_ADMIN, ADMIN, SUPPORT) ও এন্টারপ্রাইজ capability ম্যাট্রিক্স — পঠন-মাত্র।"
      >
        <div className="flex flex-wrap gap-2">
          <AdminActionButton href="/admin/settings/roles" variant="secondary">
            ভূমিকা
          </AdminActionButton>
          <AdminActionButton href="/admin/settings/permissions" variant="secondary">
            অনুমতি
          </AdminActionButton>
        </div>
      </AdminFormSection>

      <AdminFormSection title="অডিট ও ডায়াগনস্টিক" description="OTP লগ ও ভবিষ্যৎ auth audit।">
        <div className="flex flex-wrap gap-2">
          <AdminActionButton href="/admin/audit" variant="secondary">
            অডিট হাব
          </AdminActionButton>
          <AdminActionButton href="/admin/dev-tools/otp-logs" variant="secondary">
            OTP লগ
          </AdminActionButton>
        </div>
      </AdminFormSection>
    </div>
  );
}
