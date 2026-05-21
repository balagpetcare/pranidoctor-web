"use client";

import { format, parseISO } from "date-fns";
import { Banknote, PieChart, Receipt, Wallet } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin-ui/AdminEmptyState";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { AdminStatCard } from "@/components/admin-ui/AdminStatCard";
import { AdminTable } from "@/components/admin-ui/AdminTable";
import { adminFetch } from "@/lib/admin/admin-fetch";
import type { AdminBillingListItemDto } from "@/lib/admin-billing/admin-billing-service";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { cn } from "@/lib/cn";
import {
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/domain/payment-constants";

import {
  formatBdt,
  paymentMethodBn,
  paymentStatusBadgeVariant,
  paymentStatusBn,
} from "./billing-labels";

const PAGE_SIZE = 25;

function inputClassName(): string {
  return cn(
    "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
    "outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2",
    "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  );
}

function shortId(id: string): string {
  if (id.length <= 10) return id;
  return `${id.slice(0, 8)}…`;
}

export function AdminBillingList() {
  const [rows, setRows] = useState<AdminBillingListItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draftPaymentStatus, setDraftPaymentStatus] = useState("");
  const [draftPaymentMethod, setDraftPaymentMethod] = useState("");
  const [draftDateFrom, setDraftDateFrom] = useState("");
  const [draftDateTo, setDraftDateTo] = useState("");
  const [draftDoctorSearch, setDraftDoctorSearch] = useState("");

  const [appliedPaymentStatus, setAppliedPaymentStatus] = useState("");
  const [appliedPaymentMethod, setAppliedPaymentMethod] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [appliedDoctorSearch, setAppliedDoctorSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams();
      p.set("limit", String(PAGE_SIZE));
      p.set("offset", String(offset));
      if (appliedPaymentStatus)
        p.set("paymentStatus", appliedPaymentStatus);
      if (appliedPaymentMethod)
        p.set("paymentMethod", appliedPaymentMethod);
      if (appliedDateFrom) p.set("dateFrom", appliedDateFrom);
      if (appliedDateTo) p.set("dateTo", appliedDateTo);
      if (appliedDoctorSearch.trim())
        p.set("doctorSearch", appliedDoctorSearch.trim());

      const res = await adminFetch(`/api/admin/billing?${p.toString()}`);
      const data = await readAdminJson<{
        rows: AdminBillingListItemDto[];
        total: number;
      }>(res);
      setRows(data.rows);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load billing");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    offset,
    appliedPaymentStatus,
    appliedPaymentMethod,
    appliedDateFrom,
    appliedDateTo,
    appliedDoctorSearch,
  ]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void load();
  }, [load]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setOffset(0);
    setAppliedPaymentStatus(draftPaymentStatus);
    setAppliedPaymentMethod(draftPaymentMethod);
    setAppliedDateFrom(draftDateFrom);
    setAppliedDateTo(draftDateTo);
    setAppliedDoctorSearch(draftDoctorSearch);
  }

  function resetFilters() {
    setDraftPaymentStatus("");
    setDraftPaymentMethod("");
    setDraftDateFrom("");
    setDraftDateTo("");
    setDraftDoctorSearch("");
    setAppliedPaymentStatus("");
    setAppliedPaymentMethod("");
    setAppliedDateFrom("");
    setAppliedDateTo("");
    setAppliedDoctorSearch("");
    setOffset(0);
  }

  const maxOffset = Math.max(0, total - PAGE_SIZE);
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + rows.length, total);

  const pageTotals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        serviceFee: acc.serviceFee + r.serviceFee,
        travelCost: acc.travelCost + r.travelCost,
        medicineCost: acc.medicineCost + r.medicineCost,
        discount: acc.discount + r.discount,
        totalCollected: acc.totalCollected + r.totalCollected,
        platformCommission: acc.platformCommission + r.platformCommission,
        providerPayout: acc.providerPayout + r.providerPayout,
      }),
      {
        serviceFee: 0,
        travelCost: 0,
        medicineCost: 0,
        discount: 0,
        totalCollected: 0,
        platformCommission: 0,
        providerPayout: 0,
      },
    );
  }, [rows]);

  const showInitialLoading = loading && rows.length === 0;
  const showEmpty = !loading && !error && rows.length === 0;

  const tableToolbar =
    total > PAGE_SIZE ? (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {pageStart}–{pageEnd} / মোট {total}
        </p>
        <div className="flex flex-wrap gap-2">
          <AdminActionButton
            type="button"
            variant="secondary"
            disabled={offset <= 0 || loading}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            পূর্ববর্তী
          </AdminActionButton>
          <AdminActionButton
            type="button"
            variant="secondary"
            disabled={offset >= maxOffset || loading}
            onClick={() =>
              setOffset(Math.min(maxOffset, offset + PAGE_SIZE))
            }
          >
            পরবর্তী
          </AdminActionButton>
        </div>
      </div>
    ) : (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {total === 0
            ? "কোনো রেকর্ড নেই।"
            : `মোট ${total} রেকর্ড · এই পৃষ্ঠায় ${rows.length}`}
        </p>
      </div>
    );

  return (
    <div className="space-y-6" lang="bn">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="ফিল্টারে মোট রেকর্ড"
          value={String(total)}
          description="সম্পূর্ণ ফিল্টার মিলিয়ে গণনা।"
          icon={Receipt}
        />
        <AdminStatCard
          title="এই পৃষ্ঠায় মোট আদায়"
          value={formatBdt(pageTotals.totalCollected)}
          description="শুধু বর্তমান পৃষ্ঠার যোগফল।"
          icon={Wallet}
        />
        <AdminStatCard
          title="এই পৃষ্ঠায় প্ল্যাটফর্ম কমিশন"
          value={formatBdt(pageTotals.platformCommission)}
          description="কমিশন মূলত সার্ভিস ফি ভিত্তিতে (বিস্তারিত রেকর্ডে)।"
          icon={PieChart}
        />
        <AdminStatCard
          title="এই পৃষ্ঠায় প্রোভাইডার পেআউট"
          value={formatBdt(pageTotals.providerPayout)}
          description="বর্তমান পৃষ্ঠার যোগফল।"
          icon={Banknote}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="এই পৃষ্ঠায় সার্ভিস ফি"
          value={formatBdt(pageTotals.serviceFee)}
          description="সারি যোগফল।"
        />
        <AdminStatCard
          title="যাতায়াত + ওষুধ (পৃষ্ঠা)"
          value={formatBdt(pageTotals.travelCost + pageTotals.medicineCost)}
          description={`যাতায়াত ${formatBdt(pageTotals.travelCost)} · ওষুধ ${formatBdt(pageTotals.medicineCost)}`}
        />
        <AdminStatCard
          title="এই পৃষ্ঠায় ডিসকাউন্ট"
          value={formatBdt(pageTotals.discount)}
          description="চালান অনুযায়ী।"
        />
      </div>

      <AdminFormSection
        title="ফিল্টার"
        description="পেমেন্ট স্ট্যাটাস, পদ্ধতি, ডাক্তারের নাম, তারিখ।"
      >
        <form onSubmit={applyFilters} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              পেমেন্ট স্ট্যাটাস
              <select
                value={draftPaymentStatus}
                onChange={(e) => setDraftPaymentStatus(e.target.value)}
                className={inputClassName()}
              >
                <option value="">সব</option>
                {Object.values(PAYMENT_STATUS).map((s) => (
                  <option key={s} value={s}>
                    {paymentStatusBn(s)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              পেমেন্ট পদ্ধতি
              <select
                value={draftPaymentMethod}
                onChange={(e) => setDraftPaymentMethod(e.target.value)}
                className={inputClassName()}
              >
                <option value="">সব</option>
                {Object.values(PAYMENT_METHOD).map((m) => (
                  <option key={m} value={m}>
                    {paymentMethodBn(m)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              ডাক্তারের নামে খুঁজুন
              <input
                type="text"
                value={draftDoctorSearch}
                onChange={(e) => setDraftDoctorSearch(e.target.value)}
                className={inputClassName()}
                placeholder="প্রদর্শন নাম"
              />
            </label>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              তারিখ থেকে
              <input
                type="date"
                value={draftDateFrom}
                onChange={(e) => setDraftDateFrom(e.target.value)}
                className={inputClassName()}
              />
            </label>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              তারিখ পর্যন্ত
              <input
                type="date"
                value={draftDateTo}
                onChange={(e) => setDraftDateTo(e.target.value)}
                className={inputClassName()}
              />
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
        <AdminErrorState message={error} onRetry={() => void load()} />
      ) : null}

      {showInitialLoading ? (
        <AdminLoadingState message="বিলিং রেকর্ড লোড হচ্ছে…" />
      ) : null}

      {showEmpty ? (
        <AdminEmptyState
          title="কোনো বিলিং রেকর্ড নেই"
          description="এই ফিল্টারে কিছু মেলেনি।"
        />
      ) : null}

      {!error && !showInitialLoading && !showEmpty ? (
        <AdminTable toolbar={tableToolbar}>
          <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-3">কেস / অনুরোধ</th>
              <th className="px-3 py-3">ডাক্তার</th>
              <th className="px-3 py-3">গ্রাহক</th>
              <th className="px-3 py-3">খরচ (BDT)</th>
              <th className="px-3 py-3">মোট ও ভাগাভাগি</th>
              <th className="px-3 py-3">পেমেন্ট</th>
              <th className="px-3 py-3">তৈরি</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
            {rows.map((r) => (
              <tr
                key={r.id}
                className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
              >
                <td className="align-top px-3 py-3">
                  <AdminActionButton
                    href={`/admin/billing/${r.id}`}
                    variant="ghost"
                    className="h-auto min-h-0 p-0 font-medium text-emerald-800 underline-offset-2 hover:underline dark:text-emerald-400"
                  >
                    {shortId(r.id)}
                  </AdminActionButton>
                  <div className="mt-0.5 font-mono text-[11px] text-zinc-500">
                    অনুরোধ {shortId(r.serviceRequestId)}
                  </div>
                </td>
                <td className="align-top px-3 py-3 text-zinc-800 dark:text-zinc-200">
                  {r.doctor?.displayName?.trim() || "—"}
                </td>
                <td className="align-top px-3 py-3 text-zinc-800 dark:text-zinc-200">
                  {r.customer.displayName}
                </td>
                <td className="align-top px-3 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  <div>সার্ভিস ফি {formatBdt(r.serviceFee)}</div>
                  <div>যাতায়াত {formatBdt(r.travelCost)}</div>
                  <div>ওষুধ {formatBdt(r.medicineCost)}</div>
                  <div>ডিসকাউন্ট {formatBdt(r.discount)}</div>
                </td>
                <td className="align-top px-3 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    মোট আদায় {formatBdt(r.totalCollected)}
                  </div>
                  <div className="text-zinc-500">
                    প্ল্যাটফর্ম কমিশন {formatBdt(r.platformCommission)}
                  </div>
                  <div>প্রোভাইডার পেআউট {formatBdt(r.providerPayout)}</div>
                </td>
                <td className="align-top px-3 py-3">
                  <div className="flex flex-col gap-1 text-xs text-zinc-700 dark:text-zinc-300">
                    <span>{paymentMethodBn(r.paymentMethod)}</span>
                    <AdminBadge variant={paymentStatusBadgeVariant(r.paymentStatus)}>
                      পেমেন্ট: {paymentStatusBn(r.paymentStatus)}
                    </AdminBadge>
                  </div>
                </td>
                <td className="align-top px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                  {(() => {
                    try {
                      return format(parseISO(r.createdAt), "yyyy-MM-dd HH:mm");
                    } catch {
                      return r.createdAt;
                    }
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : null}
    </div>
  );
}
