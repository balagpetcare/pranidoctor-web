"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin-ui/AdminEmptyState";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { AdminTable } from "@/components/admin-ui/AdminTable";
import { AREA_TYPE, type AreaType } from "@/lib/domain/area-type-constants";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { cn } from "@/lib/cn";
import type { AdminAreaRow } from "@/types/admin-areas";

import { areaTypeBn } from "./area-labels";
import { formatAreaOptionLabel } from "./parent-options";

const PAGE_SIZE = 30;

const AREA_TYPES = [
  AREA_TYPE.DIVISION,
  AREA_TYPE.DISTRICT,
  AREA_TYPE.UPAZILA,
  AREA_TYPE.UNION,
  AREA_TYPE.VILLAGE,
  AREA_TYPE.SERVICE_AREA,
] as const;

function inputClassName(): string {
  return cn(
    "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
    "outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2",
    "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  );
}

type AppliedFilters = {
  q: string;
  type: string;
  parentId: string;
  active: string;
};

export function AreasList() {
  const [applied, setApplied] = useState<AppliedFilters>({
    q: "",
    type: "",
    parentId: "",
    active: "",
  });
  const [draft, setDraft] = useState<AppliedFilters>(applied);

  const [areas, setAreas] = useState<AdminAreaRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const [parentChoices, setParentChoices] = useState<AdminAreaRow[]>([]);

  const loadParents = useCallback(async () => {
    try {
      const data = await readAdminJson<{ areas: AdminAreaRow[] }>(
        await adminFetch(`/api/admin/areas?limit=500`),
      );
      setParentChoices(data.areas);
    } catch {
      setParentChoices([]);
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      if (applied.q.trim()) params.set("q", applied.q.trim());
      if (applied.type) params.set("type", applied.type);
      if (applied.parentId) {
        params.set(
          "parentId",
          applied.parentId === "__root__" ? "__root__" : applied.parentId,
        );
      }
      if (applied.active === "true" || applied.active === "false") {
        params.set("isActive", applied.active);
      }

      const data = await readAdminJson<{
        areas: AdminAreaRow[];
        meta: { total: number };
      }>(await adminFetch(`/api/admin/areas?${params.toString()}`));

      setAreas(data.areas);
      setTotal(data.meta.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load areas");
      setAreas([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [applied, offset]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network;
    void loadParents();
  }, [loadParents]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network;
    void loadList();
  }, [loadList]);

  async function toggleActive(area: AdminAreaRow, nextActive: boolean) {
    if (!nextActive) {
      const ok = window.confirm(
        `«${area.name}» নিষ্ক্রিয় করবেন? ডাটাবেসে থাকবে; সক্রিয় মেলানোর তালিকায় দেখাবে না।`,
      );
      if (!ok) return;
    }

    setMutatingId(area.id);
    setError(null);
    try {
      if (nextActive) {
        await readAdminJson<{ area: AdminAreaRow }>(
          await adminFetch(`/api/admin/areas/${area.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: true }),
          }),
        );
      } else {
        await readAdminJson<{ area: AdminAreaRow }>(
          await adminFetch(`/api/admin/areas/${area.id}`, { method: "DELETE" }),
        );
      }
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setMutatingId(null);
    }
  }

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setApplied({ ...draft });
    setOffset(0);
  }

  function resetFilters() {
    const empty = { q: "", type: "", parentId: "", active: "" };
    setDraft(empty);
    setApplied(empty);
    setOffset(0);
  }

  const end = Math.min(offset + areas.length, total);
  const hasPrev = offset > 0;
  const hasNext = offset + PAGE_SIZE < total;

  const showInitialLoading = loading && areas.length === 0;
  const showEmpty = !loading && !error && areas.length === 0;

  const tableToolbar = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {loading && areas.length > 0
          ? "লোড হচ্ছে…"
          : total === 0
            ? "কোনো এলাকা নেই।"
            : `${total === 0 ? 0 : offset + 1}–${end} / মোট ${total}`}
      </p>
      <div className="flex flex-wrap gap-2">
        <AdminActionButton
          type="button"
          variant="secondary"
          disabled={!hasPrev || loading}
          onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
        >
          পূর্ববর্তী
        </AdminActionButton>
        <AdminActionButton
          type="button"
          variant="secondary"
          disabled={!hasNext || loading}
          onClick={() => setOffset((o) => o + PAGE_SIZE)}
        >
          পরবর্তী
        </AdminActionButton>
      </div>
    </div>
  );

  return (
    <div className="space-y-6" lang="bn">
      <AdminFormSection
        title="খোঁজ ও ফিল্টার"
        description="নাম, বাংলা, স্লাগ দিয়ে খুঁজুন; ধরন, প্যারেন্ট ও সক্রিয়তা দিয়ে সরু করুন।"
      >
        <form onSubmit={applyFilters} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              নাম / বাংলা / স্লাগ
              <input
                type="search"
                value={draft.q}
                onChange={(ev) => setDraft((d) => ({ ...d, q: ev.target.value }))}
                placeholder="যেমন Dhaka, ঢাকা, dhaka-division"
                className={inputClassName()}
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              ধরন
              <select
                value={draft.type}
                onChange={(ev) =>
                  setDraft((d) => ({ ...d, type: ev.target.value }))
                }
                className={inputClassName()}
              >
                <option value="">সব ধরন</option>
                {AREA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {areaTypeBn(t)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              প্যারেন্ট
              <select
                value={draft.parentId}
                onChange={(ev) =>
                  setDraft((d) => ({ ...d, parentId: ev.target.value }))
                }
                className={inputClassName()}
              >
                <option value="">যেকোনো প্যারেন্ট</option>
                <option value="__root__">শুধু রুট (প্যারেন্ট ছাড়া)</option>
                {parentChoices.map((p) => (
                  <option key={p.id} value={p.id}>
                    {formatAreaOptionLabel(p)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              অবস্থা
              <select
                value={draft.active}
                onChange={(ev) =>
                  setDraft((d) => ({ ...d, active: ev.target.value }))
                }
                className={inputClassName()}
              >
                <option value="">সক্রিয় ও নিষ্ক্রিয়</option>
                <option value="true">শুধু সক্রিয়</option>
                <option value="false">শুধু নিষ্ক্রিয়</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminActionButton type="submit" variant="primary">
              ফিল্টার প্রয়োগ
            </AdminActionButton>
            <AdminActionButton type="button" variant="secondary" onClick={resetFilters}>
              রিসেট
            </AdminActionButton>
          </div>
        </form>
      </AdminFormSection>

      {error ? (
        <AdminErrorState
          message={error}
          onRetry={() => {
            void loadList();
          }}
        />
      ) : null}

      {showInitialLoading ? <AdminLoadingState message="এলাকার তালিকা লোড হচ্ছে…" /> : null}

      {showEmpty ? (
        <AdminEmptyState
          title="কোনো এলাকা নেই"
          description="এই ফিল্টারে কিছু মেলেনি। ফিল্টার শিথিল করুন বা নতুন এলাকা যোগ করুন।"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <AdminActionButton type="button" variant="secondary" onClick={resetFilters}>
                ফিল্টার রিসেট
              </AdminActionButton>
              <AdminActionButton href="/admin/areas/new" variant="primary">
                নতুন এলাকা
              </AdminActionButton>
            </div>
          }
        />
      ) : null}

      {!error && !showInitialLoading && !showEmpty ? (
        <AdminTable toolbar={tableToolbar}>
          <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">এলাকা</th>
              <th className="px-4 py-3">ধরন</th>
              <th className="px-4 py-3">প্যারেন্ট</th>
              <th className="px-4 py-3">শাখা</th>
              <th className="px-4 py-3">অবস্থা</th>
              <th className="px-4 py-3">তৈরি</th>
              <th className="px-4 py-3">আপডেট</th>
              <th className="px-4 py-3 text-end">কাজ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
            {areas.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">
                    {row.name}
                  </div>
                  {row.nameBn ? (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {row.nameBn}
                    </div>
                  ) : null}
                  <div className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                    {row.slug}
                    {row.code ? ` · ${row.code}` : ""}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {areaTypeBn(row.type)}
                </td>
                <td className="max-w-[200px] px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {row.parent ? (
                    <span className="block truncate" title={row.parent.name}>
                      <span className="text-xs text-zinc-500">
                        {areaTypeBn(row.parent.type)}
                      </span>
                      <br />
                      {row.parent.name}
                      {!row.parent.isActive ? (
                        <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">
                          (নিষ্ক্রিয় প্যারেন্ট)
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {row._count.children}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <AdminBadge variant={row.isActive ? "success" : "neutral"}>
                    {row.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </AdminBadge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                  {format(new Date(row.createdAt), "dd/MM/yyyy HH:mm")}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                  {format(new Date(row.updatedAt), "dd/MM/yyyy HH:mm")}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-end">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <AdminActionButton
                      href={`/admin/areas/${row.id}/edit`}
                      variant="ghost"
                      className="h-auto min-h-0 px-2 py-1 text-sm text-emerald-800 dark:text-emerald-400"
                    >
                      সম্পাদনা
                    </AdminActionButton>
                    {row.isActive ? (
                      <AdminActionButton
                        type="button"
                        variant="ghost"
                        className="h-auto min-h-0 px-2 py-1 text-sm text-amber-800 dark:text-amber-300"
                        disabled={mutatingId === row.id}
                        onClick={() => void toggleActive(row, false)}
                      >
                        নিষ্ক্রিয়
                      </AdminActionButton>
                    ) : (
                      <AdminActionButton
                        type="button"
                        variant="ghost"
                        className="h-auto min-h-0 px-2 py-1 text-sm text-emerald-800 dark:text-emerald-400"
                        disabled={mutatingId === row.id}
                        onClick={() => void toggleActive(row, true)}
                      >
                        সক্রিয়
                      </AdminActionButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : null}
    </div>
  );
}
