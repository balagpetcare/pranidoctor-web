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

import {
  ANIMAL_TYPE_OPTIONS,
  SEMEN_TEMPLATE_APPROVAL_STATUS_OPTIONS,
} from "./semen-ui-options";

export type AdminSemenTemplateSummary = {
  id: string;
  internalName: string;
  animalType: string;
  approvalStatus: string;
  isActive: boolean;
  updatedAt?: string;
  defaultBasePrice?: string;
  media?: { id: string }[];
  semenProvider: { name: string };
};

function approvalBadgeVariant(
  s: string,
): "success" | "warning" | "neutral" | "info" | "default" {
  if (s === "APPROVED") return "success";
  if (s === "PENDING_REVIEW" || s === "DRAFT") return "warning";
  if (s === "REJECTED") return "neutral";
  return "default";
}

export function SemenServiceTemplatesList() {
  const [rows, setRows] = useState<AdminSemenTemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [animalType, setAnimalType] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (appliedQ.trim()) qs.set("q", appliedQ.trim());
      if (animalType) qs.set("animalType", animalType);
      if (approvalStatus) qs.set("approvalStatus", approvalStatus);
      if (activeFilter !== "all") qs.set("isActive", activeFilter);
      qs.set("limit", "100");
      const data = await readAdminJson<{
        total: number;
        templates: AdminSemenTemplateSummary[];
      }>(await adminFetch(`/api/admin/semen-service-templates?${qs.toString()}`));
      setRows(data.templates);
    } catch (e) {
      setError(e instanceof Error ? e.message : "লোড করা যায়নি");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [appliedQ, animalType, approvalStatus, activeFilter]);

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
      {!error && !showInitialLoading && rows.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-zinc-500 dark:text-zinc-400">মোট টেমপ্লেট</p>
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{rows.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-zinc-500 dark:text-zinc-400">Approved</p>
            <p className="text-base font-semibold text-emerald-700 dark:text-emerald-300">
              {rows.filter((r) => r.approvalStatus === "APPROVED").length}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-zinc-500 dark:text-zinc-400">Pending</p>
            <p className="text-base font-semibold text-amber-700 dark:text-amber-300">
              {rows.filter((r) => r.approvalStatus !== "APPROVED").length}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-zinc-500 dark:text-zinc-400">Active</p>
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {rows.filter((r) => r.isActive).length}
            </p>
          </div>
        </div>
      ) : null}

      <AdminFormSection title="ফিল্টার">
        <form
          onSubmit={onSearch}
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <label className={cn("min-w-0 flex-1 sm:max-w-md", khLabelClass())}>
            নাম
            <input
              type="search"
              value={q}
              onChange={(ev) => setQ(ev.target.value)}
              className={khInputClass()}
            />
          </label>
          <label className={cn("sm:w-44", khLabelClass())}>
            প্রাণী
            <select
              value={animalType}
              onChange={(ev) => setAnimalType(ev.target.value)}
              className={khInputClass()}
            >
              <option value="">সব</option>
              {ANIMAL_TYPE_OPTIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
          <label className={cn("sm:w-52", khLabelClass())}>
            অনুমোদন
            <select
              value={approvalStatus}
              onChange={(ev) => setApprovalStatus(ev.target.value)}
              className={khInputClass()}
            >
              <option value="">সব</option>
              {SEMEN_TEMPLATE_APPROVAL_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className={cn("sm:w-40", khLabelClass())}>
            সক্রিয়
            <select
              value={activeFilter}
              onChange={(ev) =>
                setActiveFilter(ev.target.value as "all" | "true" | "false")
              }
              className={khInputClass()}
            >
              <option value="all">সব</option>
              <option value="true">হ্যাঁ</option>
              <option value="false">না</option>
            </select>
          </label>
          <AdminActionButton type="submit" variant="primary">
            প্রয়োগ
          </AdminActionButton>
        </form>
      </AdminFormSection>

      {error ? <AdminErrorState message={error} onRetry={() => void load()} /> : null}
      {showInitialLoading ? <AdminLoadingState message="টেমপ্লেট লোড হচ্ছে…" /> : null}
      {showEmpty ? (
        <AdminEmptyState
          title="কোনো টেমপ্লেট নেই"
          action={
            <AdminActionButton href="/admin/semen-service-templates/new" variant="primary">
              নতুন টেমপ্লেট
            </AdminActionButton>
          }
        />
      ) : null}

      {!error && !showInitialLoading && !showEmpty ? (
        <AdminTable>
          <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-3">নাম</th>
              <th className="px-3 py-3">প্রদানকারী</th>
              <th className="px-3 py-3">ধরন</th>
              <th className="px-3 py-3">অনুমোদন</th>
              <th className="px-3 py-3">সক্রিয়</th>
              <th className="px-3 py-3">সর্বশেষ আপডেট</th>
              <th className="px-3 py-3 text-end">কর্ম</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                <td className="px-3 py-3 font-medium">{r.internalName}</td>
                <td className="px-3 py-3 text-sm">{r.semenProvider.name}</td>
                <td className="px-3 py-3 font-mono text-xs">{r.animalType}</td>
                <td className="px-3 py-3">
                  <AdminBadge variant={approvalBadgeVariant(r.approvalStatus)}>
                    {r.approvalStatus}
                  </AdminBadge>
                </td>
                <td className="px-3 py-3">
                  <AdminBadge variant={r.isActive ? "success" : "neutral"}>
                    {r.isActive ? "হ্যাঁ" : "না"}
                  </AdminBadge>
                </td>
                <td className="px-3 py-3 text-xs text-zinc-600 dark:text-zinc-300">
                  {r.updatedAt ? new Date(r.updatedAt).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" }) : "—"}
                </td>
                <td className="px-3 py-3 text-end">
                  <Link
                    href={`/admin/semen-service-templates/${r.id}`}
                    className="me-3 text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
                  >
                    বিস্তারিত
                  </Link>
                  <Link
                    href={`/admin/semen-service-templates/${r.id}/edit`}
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
