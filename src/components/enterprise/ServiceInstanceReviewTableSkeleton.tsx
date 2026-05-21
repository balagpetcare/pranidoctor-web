"use client";

import { AdminTable } from "@/components/admin-ui/AdminTable";
import { cn } from "@/lib/cn";

function ShimmerCell({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700", className)}
      aria-hidden
    />
  );
}

export function ServiceInstanceReviewTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <AdminTable>
      <thead>
        <tr>
          <th className="px-3 py-2 text-left text-xs font-semibold">আইডি</th>
          <th className="px-3 py-2 text-left text-xs font-semibold">টেমপ্লেট</th>
          <th className="px-3 py-2 text-left text-xs font-semibold">টেকনিশিয়ান</th>
          <th className="px-3 py-2 text-left text-xs font-semibold">অবস্থা</th>
          <th className="px-3 py-2 text-left text-xs font-semibold">আপডেট</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, rowIdx) => (
          <tr key={rowIdx} className="border-t border-zinc-100 dark:border-zinc-800">
            <td className="px-3 py-3">
              <ShimmerCell className="w-20" />
            </td>
            <td className="px-3 py-3">
              <ShimmerCell className="w-32" />
            </td>
            <td className="px-3 py-3">
              <ShimmerCell className="w-28" />
            </td>
            <td className="px-3 py-3">
              <ShimmerCell className="w-24" />
            </td>
            <td className="px-3 py-3">
              <ShimmerCell className="w-36" />
            </td>
          </tr>
        ))}
      </tbody>
    </AdminTable>
  );
}
