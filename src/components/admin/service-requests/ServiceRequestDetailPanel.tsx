"use client";

import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { ServiceRequestAssignmentActions } from "@/components/admin/service-requests/ServiceRequestAssignmentActions";
import { adminFetch } from "@/lib/admin/admin-fetch";
import type { AdminServiceRequestDto } from "@/lib/admin-service-requests/service-request-admin-service";
import { readAdminJson } from "@/lib/admin/read-admin-json";

import {
  isEmergencyServiceRequest,
  serviceRequestStatusBadgeVariant,
  serviceRequestStatusBn,
  serviceRequestTypeBn,
} from "./service-request-labels";

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

export function ServiceRequestDetailPanel({
  requestId,
}: {
  requestId: string;
}) {
  const router = useRouter();
  const [row, setRow] = useState<AdminServiceRequestDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadRetryKey, setLoadRetryKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{ request: AdminServiceRequestDto }>(
        await adminFetch(`/api/admin/service-requests/${requestId}`),
      );
      setRow(data.request);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load request");
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void load();
  }, [load, loadRetryKey]);

  if (loading) {
    return <AdminLoadingState message="সেবা অনুরোধ লোড হচ্ছে…" />;
  }

  if (error && !row) {
    return (
      <div className="space-y-4">
        <AdminErrorState
          message={error}
          onRetry={() => setLoadRetryKey((k) => k + 1)}
        />
      </div>
    );
  }

  if (!row) return null;

  const animal = row.animal;
  const customer = row.customer;
  const urgent = isEmergencyServiceRequest(row);

  return (
    <div className="space-y-8" lang="bn">
      {error ? (
        <div
          className="rounded-[var(--pd-admin-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          {error}
        </div>
      ) : null}

      <AdminFormSection
        title="সেবা অনুরোধ — সারাংশ"
        description={`আইডি: ${row.id}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <AdminBadge variant={serviceRequestStatusBadgeVariant(row.status)}>
            {serviceRequestStatusBn(row.status)}
          </AdminBadge>
          <AdminBadge variant="neutral" className="font-normal">
            {serviceRequestTypeBn(row.serviceType)}
          </AdminBadge>
          {urgent ? (
            <AdminBadge variant="danger" className="font-normal">
              জরুরি
            </AdminBadge>
          ) : null}
        </div>
        {row.emergencyNotes?.trim() ? (
          <p className="mt-3 text-sm text-red-800 dark:text-red-200/90">
            <span className="font-medium">জরুরি নোট:</span>{" "}
            {row.emergencyNotes.trim()}
          </p>
        ) : null}
      </AdminFormSection>

      <AdminFormSection title="গ্রাহক" description="যোগাযোগ ও পরিচয়।">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              নাম
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {customer.displayName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              ফোন
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {customer.user.phone?.trim() || "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              ইমেইল
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {customer.user.email?.trim() || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              গ্রাহক আইডি
            </dt>
            <dd className="mt-0.5 font-mono text-xs text-zinc-700 dark:text-zinc-300">
              {customer.id}
            </dd>
          </div>
        </dl>
      </AdminFormSection>

      <AdminFormSection title="পশু" description="অনুরোধের জন্য নিবন্ধিত পশু।">
        {animal ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                নাম
              </dt>
              <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                {animal.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                প্রজাতি / ধরন
              </dt>
              <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                {[animal.species, animal.animalType ? fmtEnum(animal.animalType) : null]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                পশু আইডি
              </dt>
              <dd className="mt-0.5 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                {animal.id}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">—</p>
        )}
      </AdminFormSection>

      <AdminFormSection
        title="ডাক্তার ও এআই টেকনিশিয়ান"
        description="বর্তমান বরাদ্দ।"
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              ডাক্তার
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {row.assignedDoctor?.displayName?.trim() || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              এআই টেকনিশিয়ান
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {row.assignedTechnician?.displayName?.trim() || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              বরাদ্দের সময়
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {fmtIso(row.assignedAt)}
            </dd>
          </div>
        </dl>
      </AdminFormSection>

      <AdminFormSection title="অনুরোধের বিবরণ" description="সময়সূচি ও অবস্থান।">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              সেবার ধরন
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {serviceRequestTypeBn(row.serviceType)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              বিভাগ
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {row.serviceCategory?.name ?? "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              সমস্যা / লক্ষণ
            </dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
              {row.problemOrSymptom?.trim() || "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              বিবরণ
            </dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
              {row.description?.trim() || "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              এলাকা / অবস্থান
            </dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
              {[
                row.locationText?.trim(),
                row.areaId ? `এলাকা আইডি: ${row.areaId}` : null,
                row.villageId ? `গ্রাম আইডি: ${row.villageId}` : null,
              ]
                .filter(Boolean)
                .join("\n") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              পছন্দের সময়
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {row.preferredTime?.trim() || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              জমা দেওয়া
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {fmtIso(row.submittedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              তৈরি
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {fmtIso(row.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              হালনাগাদ
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {fmtIso(row.updatedAt)}
            </dd>
          </div>
        </dl>
      </AdminFormSection>

      <ServiceRequestAssignmentActions
        key={row.updatedAt}
        requestId={requestId}
        row={row}
        onUpdated={() => {
          void load();
          router.refresh();
        }}
      />
    </div>
  );
}
