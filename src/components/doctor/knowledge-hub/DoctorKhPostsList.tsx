"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DoctorKhStatusBadge } from "@/components/doctor/knowledge-hub/DoctorKhStatusBadge";
import {
  dkBtnPrimaryClass,
  dkCardClass,
  dkInputClass,
  dkLabelClass,
} from "@/components/doctor/knowledge-hub/styles";
import { doctorFetch } from "@/lib/doctor/doctor-fetch";
import { readDoctorJson } from "@/lib/doctor/read-doctor-json";
import { cn } from "@/lib/cn";

export type DoctorTutorialListRow = {
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

export type MobileTutorialCategory = {
  id: string;
  nameBn: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  sortOrder: number;
};

const PAGE = 20;

const STATUS_OPTIONS: { value: string; labelBn: string }[] = [
  { value: "", labelBn: "সব অবস্থা" },
  { value: "DRAFT", labelBn: "খসড়া" },
  { value: "PENDING_REVIEW", labelBn: "পর্যালোচনাধীন" },
  { value: "APPROVED", labelBn: "অনুমোদিত" },
  { value: "REJECTED", labelBn: "প্রত্যাখ্যাত" },
];

export function DoctorKhPostsList() {
  const [categories, setCategories] = useState<MobileTutorialCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [skip, setSkip] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rows, setRows] = useState<DoctorTutorialListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/mobile/tutorials/categories", {
        credentials: "same-origin",
      });
      const parsed = (await res.json()) as
        | { ok: true; data: { categories: MobileTutorialCategory[] } }
        | { ok: false };
      if (parsed.ok && "data" in parsed) {
        setCategories(parsed.data.categories);
      } else {
        setCategories([]);
      }
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

        const data = await readDoctorJson<{
          tutorials: DoctorTutorialListRow[];
          total: number;
        }>(await doctorFetch(`/api/doctor/tutorials?${params.toString()}`));

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
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

  return (
    <div className="space-y-4" lang="bn">
      <form
        onSubmit={applyFilters}
        className={cn(dkCardClass(), "grid gap-4 sm:grid-cols-2 lg:grid-cols-4")}
      >
        <label className={dkLabelClass()}>
          বিভাগ
          <select
            value={categoryId}
            onChange={(ev) => setCategoryId(ev.target.value)}
            className={dkInputClass()}
          >
            <option value="">সব বিভাগ</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameBn}
              </option>
            ))}
          </select>
        </label>
        <label className={dkLabelClass()}>
          অবস্থা
          <select
            value={approvalFilter}
            onChange={(ev) => setApprovalFilter(ev.target.value)}
            className={dkInputClass()}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.labelBn}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end sm:col-span-2 lg:col-span-2">
          <button type="submit" className={dkBtnPrimaryClass()}>
            ফিল্টার
          </button>
        </div>
      </form>

      {error ? (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:hidden">
        {loading ? (
          <p className="text-zinc-500">লোড হচ্ছে…</p>
        ) : rows.length === 0 ? (
          <p className="text-zinc-500">আপনার কোনো পোস্ট নেই।</p>
        ) : (
          rows.map((t) => (
            <div key={t.id} className={cn(dkCardClass(), "space-y-2")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <DoctorKhStatusBadge status={t.approvalStatus} />
                <Link
                  href={`/doctor/knowledge-hub/posts/${t.id}`}
                  className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-400"
                >
                  বিস্তারিত →
                </Link>
              </div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{t.title}</p>
              <p className="text-xs text-zinc-500">{t.category.nameBn}</p>
            </div>
          ))
        )}
      </div>

      <div className={cn(dkCardClass(), "hidden overflow-x-auto p-0 sm:block")}>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">অবস্থা</th>
              <th className="px-4 py-3 font-medium">শিরোনাম</th>
              <th className="px-4 py-3 font-medium">বিভাগ</th>
              <th className="px-4 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  লোড হচ্ছে…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  আপনার কোনো পোস্ট নেই।
                </td>
              </tr>
            ) : (
              rows.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 align-top">
                    <DoctorKhStatusBadge status={t.approvalStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">
                      {t.title}
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-zinc-500">{t.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {t.category.nameBn}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/doctor/knowledge-hub/posts/${t.id}`}
                      className="text-teal-700 hover:underline dark:text-teal-400"
                    >
                      দেখুন
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          {total === 0 ? "০" : `${skip + 1}–${end}`} / {total}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!hasPrev || loading}
            onClick={() => setSkip((s) => Math.max(0, s - PAGE))}
            className={cn(dkBtnPrimaryClass(), "px-3 py-1.5 text-xs")}
          >
            পূর্ববর্তী
          </button>
          <button
            type="button"
            disabled={!hasNext || loading}
            onClick={() => setSkip((s) => s + PAGE)}
            className={cn(dkBtnPrimaryClass(), "px-3 py-1.5 text-xs")}
          >
            পরবর্তী
          </button>
        </div>
      </div>
    </div>
  );
}
