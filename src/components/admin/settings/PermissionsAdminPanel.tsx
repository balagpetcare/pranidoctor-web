import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminTable } from "@/components/admin-ui/AdminTable";
import {
  ADMIN_ENTERPRISE_CAPABILITIES,
  type ServiceInstanceAdminCapability,
} from "@/lib/admin-auth/permissions";

const CAPABILITY_DETAILS: Record<
  ServiceInstanceAdminCapability,
  { description: string; navGated: string }
> = {
  "serviceInstance.view": {
    description: "এন্টারপ্রাইজ সেবা পর্যালোচনা তালিকা ও বিস্তারিত দেখা।",
    navGated: "/enterprise/services/review",
  },
  "serviceInstance.review": {
    description: "অপেক্ষমাণ/সংশোধন স্ট্যাটাসে সিদ্ধান্ত (অনুমোদন, প্রত্যাখ্যান)।",
    navGated: "এন্টারপ্রাইজ রিভিউ কনসোল",
  },
  "serviceInstance.publish": {
    description: "অনুমোদিত সেবা প্রকাশ (publish) করা।",
    navGated: "প্রকাশ বাটন",
  },
  "analytics.view": {
    description: "অ্যানালিটিক্স ড্যাশবোর্ড ও KPI দেখা।",
    navGated: "/admin/analytics",
  },
  "analytics.export": {
    description: "অ্যানালিটিক্স CSV এক্সপোর্ট।",
    navGated: "Export CSV",
  },
};

export function PermissionsAdminPanel() {
  return (
    <div className="space-y-6" lang="bn">
      <AdminFormSection
        title="এন্টারপ্রাইজ অনুমতি (capabilities)"
        description="সার্ভার ও ক্লায়েন্ট উভয় জায়গায় `adminCan()` দিয়ে যাচাই। সম্পাদনযোগ্য API নেই — কোড ম্যাট্রিক্স।"
      >
        <AdminTable>
          <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-3">অনুমতি ID</th>
              <th className="px-3 py-3">লেবেল</th>
              <th className="px-3 py-3">বিবরণ</th>
              <th className="px-3 py-3">UI গেট</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
            {ADMIN_ENTERPRISE_CAPABILITIES.map((cap) => {
              const detail = CAPABILITY_DETAILS[cap.id];
              return (
                <tr key={cap.id} className="text-sm">
                  <td className="px-3 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                    {cap.id}
                  </td>
                  <td className="px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {cap.labelBn}
                  </td>
                  <td className="max-w-sm px-3 py-3 text-zinc-700 dark:text-zinc-300">
                    {detail.description}
                  </td>
                  <td className="px-3 py-3">
                    <AdminBadge variant="info">{detail.navGated}</AdminBadge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>
      </AdminFormSection>

      <AdminFormSection
        title="অন্যান্য মডিউল"
        description="ডাক্তার, বিলিং, সার্ভিস রিকোয়েস্ট ইত্যাদি সব signed-in panel admin-এর জন্য খোলা (role-specific API guard ব্যাকএন্ডে)।"
      >
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          ভবিষ্যতে granular permission API যুক্ত হলে এই পৃষ্ঠায় সম্পূর্ণ CRUD ম্যাট্রিক্স দেখানো হবে।
          এখন শুধু এন্টারপ্রাইজ review capabilities কনফিগার করা যায়।
        </p>
      </AdminFormSection>
    </div>
  );
}
