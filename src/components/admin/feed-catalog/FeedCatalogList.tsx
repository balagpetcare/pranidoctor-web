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

import { FEED_CATEGORY_OPTIONS } from "./feed-catalog-options";

export type AdminFeedCatalogRow = {
  id: string;
  code: string;
  nameBn: string;
  nameEn: string;
  category: string;
  defaultUnit: string;
  approxPriceBdt: number | null;
  isSeeded: boolean;
  isActive: boolean;
  sortOrder: number;
};

export function FeedCatalogList() {
  const [rows, setRows] = useState<AdminFeedCatalogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [category, setCategory] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (appliedQ.trim()) qs.set("q", appliedQ.trim());
      if (category) qs.set("category", category);
      if (activeFilter !== "all") qs.set("isActive", activeFilter);
      qs.set("limit", "300");
      const data = await readAdminJson<{ total: number; items: AdminFeedCatalogRow[] }>(
        await adminFetch(`/api/admin/feed-catalog?${qs.toString()}`),
      );
      setRows(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "লোড করা যায়নি");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [appliedQ, category, activeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setAppliedQ(q);
  }

  const showInitialLoading = loading && rows.length === 0;
  const showEmpty = !loading && !error && rows.length === 0;

  return (
    <div className="space-y-6" lang="bn">
      <AdminFormSection title="ফিল্টার">
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
            />
          </label>
          <label className={cn("sm:w-48", khLabelClass())}>
            বিভাগ
            <select
              value={category}
              onChange={(ev) => setCategory(ev.target.value)}
              className={khInputClass()}
            >
              <option value="">সব</option>
              {FEED_CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.labelBn}
                </option>
              ))}
            </select>
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
      {showInitialLoading ? <AdminLoadingState message="খাদ্য তালিকা লোড হচ্ছে…" /> : null}
      {showEmpty ? (
        <AdminEmptyState
          title="কোনো খাদ্য নেই"
          action={
            <AdminActionButton href="/admin/feed-catalog/new" variant="primary">
              নতুন খাদ্য
            </AdminActionButton>
          }
        />
      ) : null}

      {!error && !showInitialLoading && !showEmpty ? (
        <AdminTable>
          <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-3">কোড</th>
              <th className="px-3 py-3">নাম (BN)</th>
              <th className="px-3 py-3">বিভাগ</th>
              <th className="px-3 py-3">দাম (৳)</th>
              <th className="px-3 py-3">সক্রিয়</th>
              <th className="px-3 py-3 text-end">কর্ম</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                <td className="px-3 py-3 font-mono text-xs">{row.code}</td>
                <td className="px-3 py-3">{row.nameBn}</td>
                <td className="px-3 py-3 text-sm">
                  {FEED_CATEGORY_OPTIONS.find((c) => c.value === row.category)?.labelBn ??
                    row.category}
                </td>
                <td className="px-3 py-3">
                  {row.approxPriceBdt != null ? `৳${row.approxPriceBdt}` : "—"}
                </td>
                <td className="px-3 py-3">
                  <AdminBadge variant={row.isActive ? "success" : "neutral"}>
                    {row.isActive ? "হ্যাঁ" : "না"}
                  </AdminBadge>
                </td>
                <td className="px-3 py-3 text-end">
                  <Link
                    href={`/admin/feed-catalog/${row.id}/edit`}
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
