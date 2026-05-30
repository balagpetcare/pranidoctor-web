"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin-ui/AdminEmptyState";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { AdminTable } from "@/components/admin-ui/AdminTable";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { cn } from "@/lib/cn";

import { khInputClass, khLabelClass } from "./styles";

export type AdminContentCategoryRow = {
  id: string;
  nameBn: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function KnowledgeHubCategoriesList() {
  const [categories, setCategories] = useState<AdminContentCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{ categories: AdminContentCategoryRow[] }>(
        await adminFetch("/api/admin/content-categories"),
      );
      setCategories(data.categories);
    } catch (e) {
      setError(e instanceof Error ? e.message : "লোড করা যায়নি");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
     
    void load();
  }, [load]);

  const filtered = categories.filter((c) => {
    if (!appliedQ.trim()) return true;
    const s = appliedQ.trim().toLowerCase();
    return (
      c.nameBn.toLowerCase().includes(s) ||
      (c.nameEn?.toLowerCase().includes(s) ?? false) ||
      c.slug.toLowerCase().includes(s)
    );
  });

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setAppliedQ(q);
  }

  const showInitialLoading = loading && categories.length === 0;
  const showEmpty = !loading && !error && filtered.length === 0;

  return (
    <div className="space-y-6" lang="bn">
      <AdminFormSection title="খুঁজুন" description="নাম বা স্লাগ দিয়ে ক্যাটাগরি ফিল্টার করুন।">
        <form
          onSubmit={onSearch}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className={cn("min-w-0 flex-1", khLabelClass())}>
            নাম / স্লাগ
            <input
              type="search"
              value={q}
              onChange={(ev) => setQ(ev.target.value)}
              className={khInputClass()}
              placeholder="যেমন: gorur-rog"
            />
          </label>
          <AdminActionButton type="submit" variant="primary">
            খুঁজুন
          </AdminActionButton>
        </form>
      </AdminFormSection>

      {error ? <AdminErrorState message={error} onRetry={() => void load()} /> : null}

      {showInitialLoading ? (
        <AdminLoadingState message="ক্যাটাগরি তালিকা লোড হচ্ছে…" />
      ) : null}

      {showEmpty ? (
        <AdminEmptyState
          title="কোনো ক্যাটাগরি নেই"
          description={appliedQ.trim() ? "এই অনুসন্ধানে কিছু মেলেনি।" : "এখনও কোনো ক্যাটাগরি যোগ করা হয়নি।"}
        />
      ) : null}

      {!error && !showInitialLoading && !showEmpty ? (
        <AdminTable>
          <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-3">ক্রম</th>
              <th className="px-3 py-3">নাম (বাংলা)</th>
              <th className="px-3 py-3">English</th>
              <th className="px-3 py-3">স্লাগ</th>
              <th className="px-3 py-3">সক্রিয়</th>
              <th className="px-3 py-3 text-end">কাজ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-zinc-500">
                  লোড হচ্ছে…
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                >
                  <td className="px-3 py-3 tabular-nums text-zinc-600 dark:text-zinc-400">
                    {c.sortOrder}
                  </td>
                  <td className="px-3 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {c.nameBn}
                  </td>
                  <td className="px-3 py-3 text-zinc-600 dark:text-zinc-300">
                    {c.nameEn ?? "—"}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                    {c.slug}
                  </td>
                  <td className="px-3 py-3">
                    <AdminBadge variant={c.isActive ? "success" : "neutral"} className="font-normal">
                      {c.isActive ? "হ্যাঁ" : "না"}
                    </AdminBadge>
                  </td>
                  <td className="px-3 py-3 text-end">
                    <AdminActionButton
                      href={`/admin/knowledge-hub/categories/${c.id}/edit`}
                      variant="secondary"
                      className="h-auto min-h-0 px-2 py-1 text-xs"
                    >
                      সম্পাদনা
                    </AdminActionButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>
      ) : null}
    </div>
  );
}
