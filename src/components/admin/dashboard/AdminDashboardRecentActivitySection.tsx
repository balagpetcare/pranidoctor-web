import { format } from "date-fns";
import Link from "next/link";

import type { AdminDashboardRecentRequestRow } from "@/lib/admin/dashboard/dashboard-types";
import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin-ui/AdminEmptyState";
import { AdminTable } from "@/components/admin-ui/AdminTable";
import {
  serviceRequestStatusBadgeVariant,
  serviceRequestStatusBn,
  serviceRequestTypeBn,
} from "@/components/admin/service-requests/service-request-labels";

export type AdminDashboardRecentActivitySectionProps = {
  recentRequests: AdminDashboardRecentRequestRow[];
};

export function AdminDashboardRecentActivitySection({
  recentRequests,
}: AdminDashboardRecentActivitySectionProps) {
  return (
    <section aria-labelledby="dash-activity-heading">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2
          id="dash-activity-heading"
          className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          সাম্প্রতিক কার্যকলাপ
        </h2>
        <Link
          href="/admin/service-requests"
          className="text-sm font-medium text-emerald-800 hover:underline dark:text-emerald-400"
        >
          সব দেখুন →
        </Link>
      </div>

      {recentRequests.length === 0 ? (
        <AdminEmptyState
          title="কোনো অনুরোধ নেই"
          description="এখনও কোনো সেবা অনুরোধ জমা হয়নি।"
          action={
            <AdminActionButton href="/admin/service-requests" variant="secondary">
              অনুরোধ প্যানেল
            </AdminActionButton>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <AdminTable>
            <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">অনুরোধ</th>
                <th className="px-4 py-3">কাস্টমার</th>
                <th className="hidden px-4 py-3 sm:table-cell">ধরন</th>
                <th className="px-4 py-3">অবস্থা</th>
                <th className="px-4 py-3 text-end">সময়</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
              {recentRequests.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/service-requests/${row.id}`}
                      className="font-mono text-xs font-medium text-emerald-800 hover:underline dark:text-emerald-400"
                    >
                      {row.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="max-w-[10rem] truncate px-4 py-3 text-zinc-800 dark:text-zinc-200">
                    {row.customerDisplayName ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-600 sm:table-cell dark:text-zinc-400">
                    {serviceRequestTypeBn(row.serviceType)}
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge variant={serviceRequestStatusBadgeVariant(row.status)}>
                      {serviceRequestStatusBn(row.status)}
                    </AdminBadge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-end text-xs text-zinc-500 dark:text-zinc-400">
                    {format(row.submittedAt, "dd/MM/yyyy HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </div>
      )}
    </section>
  );
}
