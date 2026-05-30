"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin-ui/AdminEmptyState";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AdminTable } from "@/components/admin-ui/AdminTable";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { cn } from "@/lib/cn";
import {
  applicationStatusBadgeVariant,
  applicationStatusBn,
} from "./application-labels";
import {
  AI_TECHNICIAN_STATUS,
  type AiTechnicianApplicationStatus,
} from "./ai-technician-status-constants";

const PAGE_SIZE = 20;

const FILTER_TABS: {
  key: string;
  label: string;
  status?: AiTechnicianApplicationStatus;
}[] = [
  { key: "all", label: "সব (খসড়া বাদে)" },
  { key: "submitted", label: "জমাকৃত", status: AI_TECHNICIAN_STATUS.SUBMITTED },
  {
    key: "under_review",
    label: "পর্যালোচনাধীন",
    status: AI_TECHNICIAN_STATUS.UNDER_REVIEW,
  },
  {
    key: "needs_correction",
    label: "সংশোধন",
    status: AI_TECHNICIAN_STATUS.NEEDS_CORRECTION,
  },
  { key: "approved", label: "অনুমোদিত", status: AI_TECHNICIAN_STATUS.APPROVED },
  { key: "published", label: "প্রকাশিত", status: AI_TECHNICIAN_STATUS.PUBLISHED },
  { key: "rejected", label: "প্রত্যাখ্যাত", status: AI_TECHNICIAN_STATUS.REJECTED },
  { key: "suspended", label: "স্থগিত", status: AI_TECHNICIAN_STATUS.SUSPENDED },
];

type ApplicationRow = {
  id: string;
  displayName: string | null;
  applicationStatus: AiTechnicianApplicationStatus;
  providerStatus: string;
  district: string | null;
  upazila: string | null;
  user: {
    email: string;
    phone: string | null;
    status: string;
    role: string;
  };
  updatedAt: string;
};

function inputClassName(): string {
  return cn(
    "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
    "outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2",
    "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  );
}

export function ApplicationsList() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusParam = useMemo(() => {
    const t = FILTER_TABS.find((x) => x.key === tab);
    return t?.status;
  }, [tab]);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      if (statusParam) params.set("applicationStatus", statusParam);
      if (appliedQ.trim()) params.set("q", appliedQ.trim());

      const data = await readAdminJson<{
        applications: ApplicationRow[];
        meta: { total: number };
      }>(await adminFetch(`/api/admin/ai-technician-applications?${params}`));

      setRows(data.applications);
      setTotal(data.meta.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "তালিকা লোড করা যায়নি");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [appliedQ, offset, statusParam]);

  useEffect(() => {
     
    void loadList();
  }, [loadList]);

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setAppliedQ(q);
    setOffset(0);
  }

  const end = Math.min(offset + rows.length, total);
  const hasPrev = offset > 0;
  const hasNext = offset + PAGE_SIZE < total;
  const showInitialLoading = loading && rows.length === 0;
  const showEmpty = !loading && !error && rows.length === 0;

  const toolbar = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium ring-1 transition",
              tab === t.key
                ? "bg-emerald-600 text-white ring-emerald-700"
                : "bg-zinc-100 text-zinc-800 ring-zinc-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700",
            )}
            onClick={() => {
              setTab(t.key);
              setOffset(0);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <form onSubmit={applySearch} className="flex flex-wrap items-end gap-2">
        <label className="min-w-[200px] flex-1 text-sm text-zinc-700 dark:text-zinc-200">
          <span className="block text-xs font-medium text-zinc-500">খোঁজ</span>
          <input
            className={inputClassName()}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="নাম, ফোন, ইমেইল, জেলা, উপজেলা"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          খোঁজ করুন
        </button>
      </form>
    </div>
  );

  return (
    <div className="space-y-6" lang="bn">
      <AdminPageHeader
        title="এআই টেকনিশিয়ান আবেদন"
        description="জমাকৃত ও পর্যালোচনাধীন আবেদন। স্ট্যাটাস ফিল্টার ও খোঁজ।"
        actions={
          <AdminActionButton href="/admin/ai-technicians" variant="secondary">
            টেকনিশিয়ান তালিকা
          </AdminActionButton>
        }
      />

      {error ? (
        <AdminErrorState message={error} onRetry={() => void loadList()} />
      ) : null}

      {showInitialLoading ? (
        <AdminLoadingState message="আবেদন লোড হচ্ছে…" />
      ) : (
        <AdminFormSection title="আবেদন তালিকা" description={`মোট ${total}`}>
          <AdminTable toolbar={toolbar}>
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2">নাম</th>
                <th className="px-4 py-2">স্ট্যাটাস</th>
                <th className="px-4 py-2">জেলা / উপজেলা</th>
                <th className="px-4 py-2">যোগাযোগ</th>
                <th className="px-4 py-2">ভূমিকা</th>
                <th className="px-4 py-2">আপডেট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40">
                  <td className="px-4 py-2 font-medium text-zinc-900 dark:text-zinc-50">
                    <Link
                      href={`/admin/ai-technicians/applications/${r.id}`}
                      className="text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                    >
                      {r.displayName ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <AdminBadge variant={applicationStatusBadgeVariant(r.applicationStatus)}>
                      {applicationStatusBn(r.applicationStatus)}
                    </AdminBadge>
                  </td>
                  <td className="px-4 py-2 text-zinc-800 dark:text-zinc-200">
                    {[r.district, r.upazila].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <div>{r.user.email}</div>
                    <div>{r.user.phone ?? "—"}</div>
                  </td>
                  <td className="px-4 py-2">
                    <AdminBadge variant="neutral">{r.user.role}</AdminBadge>
                  </td>
                  <td className="px-4 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {new Date(r.updatedAt).toLocaleString("bn-BD")}
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>

          {showEmpty ? (
            <div className="pt-4">
              <AdminEmptyState title="কোনো আবেদন নেই।" />
            </div>
          ) : null}

          {total > PAGE_SIZE ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span>
                {offset + 1}–{end} / {total}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!hasPrev || loading}
                  className="rounded-lg border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-700"
                  onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                >
                  পূর্ববর্তী
                </button>
                <button
                  type="button"
                  disabled={!hasNext || loading}
                  className="rounded-lg border border-zinc-300 px-3 py-1 disabled:opacity-40 dark:border-zinc-700"
                  onClick={() => setOffset((o) => o + PAGE_SIZE)}
                >
                  পরবর্তী
                </button>
              </div>
            </div>
          ) : null}
        </AdminFormSection>
      )}
    </div>
  );
}
