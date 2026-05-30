"use client";

import { format, parseISO } from "date-fns";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { AdminStatCard } from "@/components/admin-ui/AdminStatCard";
import type { AdminBillingDetailDto } from "@/lib/admin-billing/admin-billing-service";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";

import {
  billingStatusBn,
  formatBdt,
  paymentMethodBn,
  paymentStatusBadgeVariant,
  paymentStatusBn,
} from "./billing-labels";
import {
  serviceRequestStatusBn,
  serviceRequestTypeBn,
} from "../service-requests/service-request-labels";

function fmtEnum(s: string): string {
  return s.replace(/_/g, " ");
}

function fmtIso(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "yyyy-MM-dd HH:mm");
  } catch {
    return iso;
  }
}

export function AdminBillingDetail() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [row, setRow] = useState<AdminBillingDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadRetryKey, setLoadRetryKey] = useState(0);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(`/api/admin/billing/${id}`);
      const data = await readAdminJson<AdminBillingDetailDto>(res);
      setRow(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load");
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
     
    void load();
  }, [load, loadRetryKey]);

  if (loading) {
    return <AdminLoadingState message="বিলিং রেকর্ড লোড হচ্ছে…" />;
  }

  if (error || !row) {
    return (
      <div className="space-y-4">
        <AdminErrorState
          message={error ?? "পাওয়া যায়নি"}
          onRetry={() => setLoadRetryKey((k) => k + 1)}
        />
        <AdminActionButton href="/admin/billing" variant="secondary">
          ← বিলিং তালিকা
        </AdminActionButton>
      </div>
    );
  }

  return (
    <div className="space-y-8" lang="bn">
      <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{row.id}</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard title="সার্ভিস ফি" value={formatBdt(row.serviceFee)} />
        <AdminStatCard title="যাতায়াত খরচ" value={formatBdt(row.travelCost)} />
        <AdminStatCard title="ওষুধ খরচ" value={formatBdt(row.medicineCost)} />
        <AdminStatCard title="ডিসকাউন্ট" value={formatBdt(row.discount)} />
        <AdminStatCard title="মোট আদায়" value={formatBdt(row.totalCollected)} />
        <AdminStatCard
          title="প্ল্যাটফর্ম কমিশন"
          value={formatBdt(row.platformCommission)}
          description="মূলত সার্ভিস ফি ভিত্তি — সূত্র নিচে।"
        />
        <AdminStatCard
          title="প্রোভাইডার পেআউট"
          value={formatBdt(row.providerPayout)}
        />
      </div>

      <AdminFormSection
        title="পেমেন্ট ও বিলিং স্ট্যাটাস"
        description="পেমেন্ট পদ্ধতি ও লাইফসাইকেল।"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm text-zinc-700 dark:text-zinc-300">
            <span className="text-zinc-500">পদ্ধতি:</span>{" "}
            {paymentMethodBn(row.paymentMethod)}
          </div>
          <AdminBadge variant={paymentStatusBadgeVariant(row.paymentStatus)}>
            পেমেন্ট স্ট্যাটাস: {paymentStatusBn(row.paymentStatus)}
          </AdminBadge>
          <AdminBadge variant="neutral" className="font-normal">
            বিলিং: {billingStatusBn(row.billingStatus)}
          </AdminBadge>
        </div>
        {row.issuedAt || row.paidAt ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {row.issuedAt ? (
              <div>
                <dt className="text-xs font-medium text-zinc-500">ইস্যুর সময়</dt>
                <dd className="text-sm">{fmtIso(row.issuedAt)}</dd>
              </div>
            ) : null}
            {row.paidAt ? (
              <div>
                <dt className="text-xs font-medium text-zinc-500">পরিশোধের সময়</dt>
                <dd className="text-sm">{fmtIso(row.paidAt)}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        {row.notes?.trim() ? (
          <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
            <span className="font-medium text-zinc-500">নোট:</span> {row.notes.trim()}
          </p>
        ) : null}
      </AdminFormSection>

      <div className="rounded-[var(--pd-admin-radius,0.75rem)] border border-emerald-200/90 bg-emerald-50/80 p-5 shadow-[var(--pd-admin-card-shadow)] dark:border-emerald-900/40 dark:bg-emerald-950/30">
        <h2 className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
          {row.commissionFormula.title}
        </h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm leading-relaxed text-emerald-950 dark:text-emerald-100">
          {row.commissionFormula.lines.map((line: string, i: number) => (
            <li key={i} className="font-mono text-xs sm:text-sm">
              {line}
            </li>
          ))}
        </ul>
      </div>

      <AdminFormSection title="সংযুক্ত রেকর্ড" description="সেবা অনুরোধ, চিকিৎসা, ডাক্তার ও গ্রাহক।">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              সেবা অনুরোধ
            </dt>
            <dd className="mt-0.5">
              <AdminActionButton
                href={`/admin/service-requests/${row.serviceRequestId}`}
                variant="ghost"
                className="h-auto min-h-0 p-0 font-mono text-sm text-emerald-800 underline-offset-2 hover:underline dark:text-emerald-400"
              >
                {row.serviceRequestId}
              </AdminActionButton>
              {row.serviceRequest ? (
                <span className="ml-2 text-xs text-zinc-500">
                  ({serviceRequestStatusBn(row.serviceRequest.status)} ·{" "}
                  {serviceRequestTypeBn(row.serviceRequest.serviceType)})
                </span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              চিকিৎসা কেস
            </dt>
            <dd className="mt-0.5 font-mono text-sm">
              {row.treatmentCaseId ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              ডাক্তার
            </dt>
            <dd className="mt-0.5">
              {row.doctor ? (
                <AdminActionButton
                  href={`/admin/doctors/${row.doctor.id}`}
                  variant="ghost"
                  className="h-auto min-h-0 p-0 text-emerald-800 underline-offset-2 hover:underline dark:text-emerald-400"
                >
                  {row.doctor.displayName ?? row.doctor.id}
                </AdminActionButton>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              গ্রাহক
            </dt>
            <dd className="mt-0.5">
              {row.customer.displayName}
              {row.customer.userEmail ? (
                <span className="ml-2 text-xs text-zinc-500">
                  ({row.customer.userEmail})
                </span>
              ) : null}
            </dd>
          </div>
        </dl>

        {row.serviceRequest?.animal ? (
          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              পশু
            </h3>
            <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
              {row.serviceRequest.animal.name} · {row.serviceRequest.animal.species}
            </p>
          </div>
        ) : null}

        {row.treatmentCase ? (
          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              চিকিৎসা কেস
            </h3>
            <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
              {fmtEnum(row.treatmentCase.status)}
              {row.treatmentCase.diagnosis?.trim()
                ? ` — ${row.treatmentCase.diagnosis.trim()}`
                : ""}
            </p>
          </div>
        ) : null}
      </AdminFormSection>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        তৈরি {fmtIso(row.createdAt)} · হালনাগাদ {fmtIso(row.updatedAt)}
      </p>
    </div>
  );
}
