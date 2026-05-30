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
import type { AdminDoctorListRow } from "@/types/admin-doctors";

import {
  doctorVerificationBn,
  providerStatusBadgeVariant,
  providerStatusBn,
  userStatusBadgeVariant,
  userStatusBn,
  verificationBadgeVariant,
} from "./doctor-labels";

const PAGE_SIZE = 20;

function inputClassName(): string {
  return cn(
    "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
    "outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2",
    "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  );
}

function fmtFee(bdt: string | null): string {
  if (bdt == null || bdt === "") return "—";
  const n = Number(bdt);
  if (!Number.isFinite(n)) return bdt;
  return `৳${n.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

export function DoctorsList() {
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [doctors, setDoctors] = useState<AdminDoctorListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutating, setMutating] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      if (appliedQ.trim()) params.set("q", appliedQ.trim());

      const data = await readAdminJson<{
        doctors: AdminDoctorListRow[];
        meta: { total: number };
      }>(await adminFetch(`/api/admin/doctors?${params.toString()}`));

      setDoctors(data.doctors);
      setTotal(data.meta.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load doctors");
      setDoctors([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [appliedQ, offset]);

  useEffect(() => {
     
    void loadList();
  }, [loadList]);

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setAppliedQ(q);
    setOffset(0);
  }

  async function postAction(
    doctorId: string,
    path: string,
    confirmMsg?: string,
  ) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    const key = `${doctorId}:${path}`;
    setMutating(key);
    setError(null);
    try {
      await readAdminJson<{ doctor: unknown }>(
        await adminFetch(`/api/admin/doctors/${doctorId}/${path}`, {
          method: "POST",
        }),
      );
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setMutating(null);
    }
  }

  const end = Math.min(offset + doctors.length, total);
  const hasPrev = offset > 0;
  const hasNext = offset + PAGE_SIZE < total;

  const showInitialLoading = loading && doctors.length === 0;
  const showEmpty = !loading && !error && doctors.length === 0;

  const tableToolbar = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {loading && doctors.length > 0
          ? "লোড হচ্ছে…"
          : total === 0
            ? "কোনো ডাক্তার নেই।"
            : `${total === 0 ? 0 : offset + 1}–${end} / মোট ${total}${appliedQ.trim() ? " · ফিল্টার প্রয়োগ" : ""}`}
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
        title="খোঁজ"
        description="নাম, ইমেইল, ফোন বা লাইসেন্স দিয়ে খুঁজুন।"
      >
        <form onSubmit={applySearch} className="space-y-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            অনুসন্ধান
            <input
              type="search"
              value={q}
              onChange={(ev) => setQ(ev.target.value)}
              placeholder="যেমন doctor@example.com"
              className={inputClassName()}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <AdminActionButton type="submit" variant="primary">
              খুঁজুন
            </AdminActionButton>
            <AdminActionButton
              type="button"
              variant="secondary"
              onClick={() => {
                setQ("");
                setAppliedQ("");
                setOffset(0);
              }}
            >
              রিসেট
            </AdminActionButton>
          </div>
        </form>
      </AdminFormSection>

      {error ? (
        <AdminErrorState message={error} onRetry={() => void loadList()} />
      ) : null}

      {showInitialLoading ? (
        <AdminLoadingState message="ডাক্তারের তালিকা লোড হচ্ছে…" />
      ) : null}

      {showEmpty ? (
        <AdminEmptyState
          title="কোনো ডাক্তার নেই"
          description="এই অনুসন্ধানে কিছু মেলেনি।"
          action={
            <AdminActionButton href="/admin/doctors/new" variant="primary">
              নতুন ডাক্তার
            </AdminActionButton>
          }
        />
      ) : null}

      {!error && !showInitialLoading && !showEmpty ? (
        <AdminTable toolbar={tableToolbar}>
          <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-3">ডাক্তার</th>
              <th className="px-3 py-3">ফোন</th>
              <th className="px-3 py-3">ইমেইল</th>
              <th className="px-3 py-3">ডিগ্রি / বিশেষতা</th>
              <th className="px-3 py-3">যাচাই / স্ট্যাটাস</th>
              <th className="px-3 py-3">অ্যাকাউন্ট</th>
              <th className="px-3 py-3">জরুরি</th>
              <th className="px-3 py-3">অনলাইন</th>
              <th className="px-3 py-3">ভিজিট ফি</th>
              <th className="px-3 py-3 text-end">কাজ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
            {doctors.map((d) => {
              const degSpec = [d.degree, d.specialization]
                .filter(Boolean)
                .join(" · ");
              const busy = (suffix: string) => mutating === `${d.id}:${suffix}`;
              return (
                <tr
                  key={d.id}
                  className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                >
                  <td className="align-top px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {d.displayName ?? "—"}
                  </td>
                  <td className="align-top px-3 py-3 text-zinc-700 dark:text-zinc-300">
                    {d.user.phone ?? "—"}
                  </td>
                  <td className="align-top px-3 py-3 text-zinc-700 dark:text-zinc-300">
                    {d.user.email}
                  </td>
                  <td className="align-top px-3 py-3 text-zinc-700 dark:text-zinc-300">
                    {degSpec || "—"}
                  </td>
                  <td className="align-top px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <AdminBadge variant={verificationBadgeVariant(d.verificationSummary)}>
                        {doctorVerificationBn(d.verificationSummary)}
                      </AdminBadge>
                      <AdminBadge variant={providerStatusBadgeVariant(d.providerStatus)}>
                        {providerStatusBn(d.providerStatus)}
                      </AdminBadge>
                    </div>
                  </td>
                  <td className="align-top px-3 py-3">
                    <AdminBadge variant={userStatusBadgeVariant(d.user.status)}>
                      {userStatusBn(d.user.status)}
                    </AdminBadge>
                  </td>
                  <td className="align-top px-3 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {d.acceptsEmergency ? "হ্যাঁ" : "না"}
                  </td>
                  <td className="align-top px-3 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {d.acceptsOnlineConsultation ? "হ্যাঁ" : "না"}
                  </td>
                  <td className="align-top px-3 py-3 text-zinc-700 dark:text-zinc-300">
                    {fmtFee(d.visitFeeBdt)}
                  </td>
                  <td className="align-top px-3 py-3 text-end">
                    <div className="flex max-w-[280px] flex-col items-end gap-2">
                      <div className="flex flex-wrap justify-end gap-1">
                        <AdminActionButton
                          href={`/admin/doctors/${d.id}`}
                          variant="secondary"
                          className="h-auto min-h-0 px-2 py-1 text-xs"
                        >
                          দেখুন
                        </AdminActionButton>
                        <AdminActionButton
                          href={`/admin/doctors/${d.id}/edit`}
                          variant="primary"
                          className="h-auto min-h-0 px-2 py-1 text-xs"
                        >
                          সম্পাদনা
                        </AdminActionButton>
                      </div>
                      <div className="flex flex-wrap justify-end gap-1">
                        <AdminActionButton
                          type="button"
                          variant="primary"
                          className="h-auto min-h-0 px-2 py-1 text-xs"
                          disabled={busy("approve")}
                          onClick={() => void postAction(d.id, "approve")}
                        >
                          {busy("approve") ? "…" : "অনুমোদন"}
                        </AdminActionButton>
                        <AdminActionButton
                          type="button"
                          variant="secondary"
                          className="h-auto min-h-0 border-0 bg-sky-700 px-2 py-1 text-xs text-white hover:bg-sky-800"
                          disabled={busy("verify")}
                          onClick={() => void postAction(d.id, "verify")}
                        >
                          {busy("verify") ? "…" : "যাচাই"}
                        </AdminActionButton>
                        <AdminActionButton
                          type="button"
                          variant="secondary"
                          className="h-auto min-h-0 px-2 py-1 text-xs"
                          disabled={busy("activate")}
                          onClick={() => void postAction(d.id, "activate")}
                        >
                          {busy("activate") ? "…" : "সক্রিয়"}
                        </AdminActionButton>
                        <AdminActionButton
                          type="button"
                          variant="danger"
                          className="h-auto min-h-0 px-2 py-1 text-xs"
                          disabled={busy("reject")}
                          onClick={() =>
                            void postAction(
                              d.id,
                              "reject",
                              "এই ডাক্তার প্রত্যাখ্যান করবেন? প্রোভাইডার প্রত্যাখ্যাত ও অ্যাকাউন্ট সাসপেন্ড হবে।",
                            )
                          }
                        >
                          {busy("reject") ? "…" : "প্রত্যাখ্যান"}
                        </AdminActionButton>
                        <AdminActionButton
                          type="button"
                          variant="secondary"
                          className="h-auto min-h-0 bg-zinc-700 px-2 py-1 text-xs text-white hover:bg-zinc-800"
                          disabled={busy("suspend")}
                          onClick={() =>
                            void postAction(
                              d.id,
                              "suspend",
                              "এই ডাক্তার সাসপেন্ড করবেন? পুনরায় সক্রিয় না হওয়া পর্যন্ত প্ল্যাটফর্মে ব্লক থাকবেন।",
                            )
                          }
                        >
                          {busy("suspend") ? "…" : "সাসপেন্ড"}
                        </AdminActionButton>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>
      ) : null}
    </div>
  );
}
