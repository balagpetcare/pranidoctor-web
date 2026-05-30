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

import type { AdminContentCategoryRow } from "./KnowledgeHubCategoriesList";
import { approvalStatusBn } from "./knowledge-hub-labels";
import { KnowledgeHubStatusBadge } from "./KnowledgeHubStatusBadge";
import { khInputClass, khLabelClass } from "./styles";

export type AdminTutorialListRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  coverImageUrl: string | null;
  approvalStatus: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  category: {
    id: string;
    nameBn: string;
    nameEn: string | null;
    slug: string;
  };
  author: {
    userId: string;
    role: string;
    displayName: string | null;
  };
};

const PAGE = 20;

const STATUS_FILTER_VALUES = ["", "DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED"] as const;

export function KnowledgeHubPostsList() {
  const [categories, setCategories] = useState<AdminContentCategoryRow[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [skip, setSkip] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rows, setRows] = useState<AdminTutorialListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const data = await readAdminJson<{ categories: AdminContentCategoryRow[] }>(
        await adminFetch("/api/admin/content-categories"),
      );
      setCategories(data.categories);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadPostsAt = useCallback(
    async (skipVal: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("take", String(PAGE));
        params.set("skip", String(skipVal));
        if (categoryId) params.set("categoryId", categoryId);
        if (approvalFilter) params.set("approvalStatus", approvalFilter);

        const data = await readAdminJson<{
          tutorials: AdminTutorialListRow[];
          total: number;
        }>(await adminFetch(`/api/admin/tutorials?${params.toString()}`));

        setRows(data.tutorials);
        setTotal(data.total);
      } catch (e) {
        setError(e instanceof Error ? e.message : "লোড করা যায়নি");
        setRows([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [approvalFilter, categoryId],
  );

  useEffect(() => {
     
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
     
    void loadPostsAt(skip);
  }, [loadPostsAt, skip, refreshKey]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    if (skip === 0) {
      setRefreshKey((k) => k + 1);
    } else {
      setSkip(0);
    }
  }

  const end = Math.min(skip + rows.length, total);
  const hasPrev = skip > 0;
  const hasNext = skip + PAGE < total;

  const showInitialLoading = loading && rows.length === 0;
  const showEmpty = !loading && !error && rows.length === 0;

  const tableToolbar = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {loading && rows.length > 0
          ? "লোড হচ্ছে…"
          : total === 0
            ? "কোনো টিউটোরিয়াল নেই।"
            : `${total === 0 ? 0 : skip + 1}–${end} / মোট ${total}`}
      </p>
      <div className="flex flex-wrap gap-2">
        <AdminActionButton
          type="button"
          variant="secondary"
          disabled={!hasPrev || loading}
          onClick={() => setSkip((s) => Math.max(0, s - PAGE))}
        >
          পূর্ববর্তী
        </AdminActionButton>
        <AdminActionButton
          type="button"
          variant="secondary"
          disabled={!hasNext || loading}
          onClick={() => setSkip((s) => s + PAGE)}
        >
          পরবর্তী
        </AdminActionButton>
      </div>
    </div>
  );

  return (
    <div className="space-y-6" lang="bn">
      <AdminFormSection title="ফিল্টার" description="ক্যাটাগরি ও অনুমোদন অবস্থা।">
        <form
          onSubmit={applyFilters}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
        >
          <label className={khLabelClass()}>
            ক্যাটাগরি
            <select
              value={categoryId}
              onChange={(ev) => setCategoryId(ev.target.value)}
              className={khInputClass()}
            >
              <option value="">সব ক্যাটাগরি</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameBn} ({c.slug})
                </option>
              ))}
            </select>
          </label>
          <label className={khLabelClass()}>
            অনুমোদন অবস্থা
            <select
              value={approvalFilter}
              onChange={(ev) => setApprovalFilter(ev.target.value)}
              className={khInputClass()}
            >
              {STATUS_FILTER_VALUES.map((v) => (
                <option key={v || "all"} value={v}>
                  {v === "" ? "সব অবস্থা" : approvalStatusBn(v)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end sm:col-span-2 lg:col-span-2">
            <AdminActionButton type="submit" variant="primary">
              ফিল্টার প্রয়োগ
            </AdminActionButton>
          </div>
        </form>
      </AdminFormSection>

      {error ? (
        <AdminErrorState message={error} onRetry={() => setRefreshKey((k) => k + 1)} />
      ) : null}

      {showInitialLoading ? (
        <AdminLoadingState message="টিউটোরিয়াল তালিকা লোড হচ্ছে…" />
      ) : null}

      {showEmpty ? (
        <AdminEmptyState
          title="কোনো টিউটোরিয়াল নেই"
          description="এই ফিল্টারে কিছু মেলেনি।"
        />
      ) : null}

      {!error && !showInitialLoading && !showEmpty ? (
        <AdminTable toolbar={tableToolbar}>
          <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-3">অবস্থা</th>
              <th className="px-3 py-3">টিউটোরিয়াল</th>
              <th className="px-3 py-3">ক্যাটাগরি</th>
              <th className="px-3 py-3">লেখক</th>
              <th className="px-3 py-3 text-end">কাজ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
            {rows.map((t) => (
              <tr
                key={t.id}
                className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
              >
                <td className="align-top px-3 py-3">
                  <div className="flex flex-col gap-1">
                    <KnowledgeHubStatusBadge status={t.approvalStatus} />
                    {t.isPublished ? (
                      <AdminBadge variant="success" className="w-fit font-normal">
                        প্রকাশিত
                      </AdminBadge>
                    ) : null}
                  </div>
                </td>
                <td className="align-top px-3 py-3">
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">{t.title}</div>
                  <div className="mt-0.5 font-mono text-xs text-zinc-500">{t.slug}</div>
                </td>
                <td className="align-top px-3 py-3">
                  <AdminBadge variant="neutral" className="font-normal">
                    {t.category.nameBn}
                  </AdminBadge>
                </td>
                <td className="align-top px-3 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                  {t.author.displayName ?? "—"}
                  <div className="text-[11px] uppercase text-zinc-400">{t.author.role}</div>
                </td>
                <td className="align-top px-3 py-3 text-end">
                  <AdminActionButton
                    href={`/admin/knowledge-hub/posts/${t.id}`}
                    variant="secondary"
                    className="h-auto min-h-0 px-2 py-1 text-xs"
                  >
                    দেখুন
                  </AdminActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : null}
    </div>
  );
}
