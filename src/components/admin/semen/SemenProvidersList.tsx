"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin-ui/AdminEmptyState";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { AdminTable } from "@/components/admin-ui/AdminTable";
import { khInputClass, khLabelClass } from "@/components/admin/knowledge-hub/styles";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { cn } from "@/lib/cn";

export type AdminSemenProviderRow = {
  id: string;
  slug: string;
  name: string;
  nameBn: string | null;
  isActive: boolean;
  verificationStatus: string;
  sortOrder: number;
};

export function SemenProvidersList() {
  const [rows, setRows] = useState<AdminSemenProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (appliedQ.trim()) qs.set("q", appliedQ.trim());
      if (activeFilter !== "all") qs.set("isActive", activeFilter);
      qs.set("limit", "100");
      const data = await readAdminJson<{ total: number; providers: AdminSemenProviderRow[] }>(
        await adminFetch(`/api/admin/semen-providers?${qs.toString()}`),
      );
      setRows(data.providers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "লোড করা যায়নি");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [appliedQ, activeFilter]);

  useEffect(() => {
     
    void load();
  }, [load]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setAppliedQ(q);
  }

  const showInitialLoading = loading && rows.length === 0;
  const filtered = rows.filter((r) => {
    if (!appliedQ.trim()) return true;
    const s = appliedQ.trim().toLowerCase();
    return (
      r.name.toLowerCase().includes(s) ||
      (r.nameBn?.toLowerCase().includes(s) ?? false) ||
      r.slug.toLowerCase().includes(s)
    );
  });
  const showEmpty = !loading && !error && filtered.length === 0;

  return (
    <div className="space-y-6" lang="bn">
      <AdminFormSection title="ফিল্টার" description="নাম বা স্লাগ দিয়ে খুঁজুন।">
        <form
          onSubmit={onSearch}
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <label className={cn("min-w-0 flex-1 sm:max-w-md", khLabelClass())}>
            অনুসন্ধান
            <input
              type="search"
              value={q}
              onChange={(ev) => setQ(ev.target.value)}
              className={khInputClass()}
              placeholder="যেমন: brac"
            />
          </label>
          <label className={cn("sm:w-44", khLabelClass())}>
            সক্রিয়তা
            <select
              value={activeFilter}
              onChange={(ev) =>
                setActiveFilter(ev.target.value as "all" | "true" | "false")
              }
              className={khInputClass()}
            >
              <option value="all">সব</option>
              <option value="true">সক্রিয়</option>
              <option value="false">নিষ্ক্রিয়</option>
            </select>
          </label>
          <AdminActionButton type="submit" variant="primary">
            প্রয়োগ
          </AdminActionButton>
        </form>
      </AdminFormSection>

      {error ? <AdminErrorState message={error} onRetry={() => void load()} /> : null}
      {showInitialLoading ? <AdminLoadingState message="প্রদানকারী লোড হচ্ছে…" /> : null}
      {showEmpty ? (
        <AdminEmptyState
          title="কোনো প্রদানকারী নেই"
          description="নতুন সিমেন প্রদানকারী যোগ করুন।"
          action={
            <AdminActionButton href="/admin/semen-providers/new" variant="primary">
              নতুন প্রদানকারী
            </AdminActionButton>
          }
        />
      ) : null}

      {!error && !showInitialLoading && !showEmpty ? (
        <AdminTable>
          <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-3">নাম</th>
              <th className="px-3 py-3">স্লাগ</th>
              <th className="px-3 py-3">যাচাই</th>
              <th className="px-3 py-3">সক্রিয়</th>
              <th className="px-3 py-3 text-end">কর্ম</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                <td className="px-3 py-3">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{r.name}</div>
                  {r.nameBn ? (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{r.nameBn}</div>
                  ) : null}
                </td>
                <td className="px-3 py-3 font-mono text-xs">{r.slug}</td>
                <td className="px-3 py-3">
                  <AdminBadge variant="neutral">{r.verificationStatus}</AdminBadge>
                </td>
                <td className="px-3 py-3">
                  <AdminBadge variant={r.isActive ? "success" : "neutral"}>
                    {r.isActive ? "হ্যাঁ" : "না"}
                  </AdminBadge>
                </td>
                <td className="px-3 py-3 text-end">
                  <Link
                    href={`/admin/semen-providers/${r.id}/edit`}
                    className="text-sm font-medium text-emerald-800 hover:underline dark:text-emerald-400"
                  >
                    সম্পাদনা
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : null}
    </div>
  );
}
