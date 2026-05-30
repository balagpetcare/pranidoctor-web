import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { getAdminDashboardActor } from "@/lib/admin-auth/dashboard-guard";
import { roleLabelBn } from "@/components/admin-ui/admin-nav-permissions";

export default async function AdminAccessDeniedPage() {
  const actor = await getAdminDashboardActor();

  return (
    <div className="mx-auto max-w-lg space-y-6" lang="bn">
      <AdminPageHeader
        title="অ্যাক্সেস নেই"
        description="আপনার অ্যাকাউন্টে এই পৃষ্ঠা বা কাজের জন্য প্রয়োজনীয় অনুমতি নেই।"
      />
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <p>
          সাইন ইন: <span className="font-medium">{actor.email}</span>
        </p>
        <p className="mt-1">
          ভূমিকা: <span className="font-medium">{roleLabelBn(actor.role)}</span>
        </p>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        ভুল মনে হলে সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।
      </p>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/admin" className="font-medium text-emerald-700 underline hover:no-underline dark:text-emerald-400">
          ড্যাশবোর্ডে ফিরুন
        </Link>
        <Link href="/admin/settings/roles" className="text-zinc-600 underline hover:no-underline dark:text-zinc-400">
          ভূমিকা ও অনুমতি দেখুন
        </Link>
      </div>
    </div>
  );
}
