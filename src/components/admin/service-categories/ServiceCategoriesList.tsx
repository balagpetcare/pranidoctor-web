"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminEmptyState } from "@/components/admin-ui/AdminEmptyState";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { AdminTable } from "@/components/admin-ui/AdminTable";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { cn } from "@/lib/cn";
import type { AdminServiceCategoryOption } from "@/types/admin-doctors";

const PAGE_SIZE = 25;

function inputClassName(): string {
  return cn(
    "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
    "outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2",
    "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  );
}

export function ServiceCategoriesList() {
  const [categories, setCategories] = useState<AdminServiceCategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draftQ, setDraftQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [offset, setOffset] = useState(0);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{ categories: AdminServiceCategoryOption[] }>(
        await adminFetch("/api/admin/service-categories"),
      );
      setCategories(data.categories);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ক্যাটাগরি লোড করা যায়নি");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
     
    void loadList();
  }, [loadList]);

  const filtered = useMemo(() => {
    const q = appliedQ.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description?.toLowerCase().includes(q) ?? false),
    );
  }, [categories, appliedQ]);

  const page = filtered.slice(offset, offset + PAGE_SIZE);
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setAppliedQ(draftQ);
    setOffset(0);
  }

  function clearSearch() {
    setDraftQ("");
    setAppliedQ("");
    setOffset(0);
  }

  return (
    <div className="space-y-6">
      <AdminFormSection
        title="অনুসন্ধান"
        description="নাম, স্লাগ বা বিবরণ দিয়ে সার্চ করুন (ক্লায়েন্ট-সাইড)।"
      >
        <form onSubmit={applySearch} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[min(100%,16rem)] flex-1">
            <label htmlFor="sc-q" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              অনুসন্ধান
            </label>
            <input
              id="sc-q"
              type="search"
              value={draftQ}
              onChange={(e) => setDraftQ(e.target.value)}
              placeholder="যেমন: doctor, ai"
              className={inputClassName()}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            প্রয়োগ
          </button>
          {appliedQ ? (
            <button
              type="button"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
              onClick={clearSearch}
            >
              মুছুন
            </button>
          ) : null}
        </form>
      </AdminFormSection>

      <AdminFormSection
        title="ক্যাটাগরি তালিকা"
        description="পঠন-মাত্র (read-only)। তৈরি/সম্পাদনার জন্য ব্যাকএন্ড POST/PATCH API প্রয়োজন।"
      >
        {loading ? <AdminLoadingState message="ক্যাটাগরি লোড হচ্ছে…" /> : null}
        {error ? (
          <AdminErrorState message={error} onRetry={() => void loadList()} />
        ) : null}
        {!loading && !error && total === 0 ? (
          <AdminEmptyState
            title="কোনো ক্যাটাগরি নেই"
            description={
              appliedQ
                ? "অনুসন্ধানের সাথে মিলে যাওয়া ক্যাটাগরি পাওয়া যায়নি।"
                : "ডাটাবেসে এখনো কোনো সার্ভিস ক্যাটাগরি নেই।"
            }
          />
        ) : null}
        {!loading && !error && total > 0 ? (
          <>
            <p className="mb-3 text-sm text-[var(--pd-admin-muted)]">
              মোট {total}টি · পৃষ্ঠা {currentPage}/{pageCount}
            </p>
            <AdminTable>
              <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
                <tr>
                  <th className="px-3 py-3">নাম</th>
                  <th className="px-3 py-3">স্লাগ</th>
                  <th className="px-3 py-3">বিবরণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
                {page.map((c) => (
                  <tr key={c.id} className="text-sm">
                    <td className="px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {c.name}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                      {c.slug}
                    </td>
                    <td className="max-w-md px-3 py-3 text-zinc-700 dark:text-zinc-300">
                      {c.description?.trim() || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
            {pageCount > 1 ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={offset === 0}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-600"
                  onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                >
                  আগের
                </button>
                <button
                  type="button"
                  disabled={offset + PAGE_SIZE >= total}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-zinc-600"
                  onClick={() => setOffset((o) => o + PAGE_SIZE)}
                >
                  পরের
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </AdminFormSection>
    </div>
  );
}
