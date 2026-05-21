import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminTable } from "@/components/admin-ui/AdminTable";
import {
  ADMIN_ENTERPRISE_CAPABILITIES,
  getAdminPanelRoleAccessMatrix,
} from "@/lib/admin-auth/permissions";

export function RolesAdminPanel() {
  const rows = getAdminPanelRoleAccessMatrix();

  return (
    <div className="space-y-6" lang="bn">
      <AdminFormSection
        title="অ্যাডমিন ভূমিকা"
        description="JWT-এ সংরক্ষিত UserRole। CRUD API নেই — ভূমিকা ডাটাবেস/সিড থেকে নির্ধারিত।"
      >
        <AdminTable>
          <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-3">ভূমিকা</th>
              <th className="px-3 py-3">কোড</th>
              <th className="px-3 py-3">প্যানেল অ্যাক্সেস</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.role} className="text-sm">
                <td className="px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  {row.labelBn}
                </td>
                <td className="px-3 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  {row.role}
                </td>
                <td className="px-3 py-3">
                  <AdminBadge variant="success">সক্রিয়</AdminBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </AdminFormSection>

      <AdminFormSection
        title="ভূমিকা × অনুমতি ম্যাট্রিক্স"
        description="এন্টারপ্রাইজ সেবা পর্যালোচনার জন্য ক্লায়েন্ট-সাইড capability গেট (`permissions.ts`)।"
      >
        <AdminTable>
          <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-3">ভূমিকা</th>
              {ADMIN_ENTERPRISE_CAPABILITIES.map((cap) => (
                <th key={cap.id} className="px-3 py-3">
                  {cap.labelBn}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.role} className="text-sm">
                <td className="px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  {row.labelBn}
                </td>
                {ADMIN_ENTERPRISE_CAPABILITIES.map((cap) => (
                  <td key={cap.id} className="px-3 py-3">
                    <AdminBadge variant={row.capabilities[cap.id] ? "success" : "neutral"}>
                      {row.capabilities[cap.id] ? "হ্যাঁ" : "না"}
                    </AdminBadge>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </AdminFormSection>
    </div>
  );
}
