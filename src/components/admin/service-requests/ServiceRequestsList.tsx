"use client";

import { format, parseISO } from "date-fns";
import { useCallback, useEffect, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin-ui/AdminEmptyState";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { AdminTable } from "@/components/admin-ui/AdminTable";
import { adminFetch } from "@/lib/admin/admin-fetch";
import type { AdminServiceRequestDto } from "@/lib/admin-service-requests/service-request-admin-service";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { cn } from "@/lib/cn";
import type { AdminAreaRow } from "@/types/admin-areas";
import {
  ServiceRequestStatus,
  ServiceRequestType,
} from "@/generated/prisma/browser";

import {
  isEmergencyServiceRequest,
  serviceRequestStatusBadgeVariant,
  serviceRequestStatusBn,
  serviceRequestTypeBn,
} from "./service-request-labels";

const PAGE_SIZE = 20;

const STATUS_TABS: { value: "" | ServiceRequestStatus; label: string }[] = [
  { value: "", label: "সব" },
  { value: ServiceRequestStatus.PENDING, label: "অপেক্ষমাণ" },
  { value: ServiceRequestStatus.ACCEPTED, label: "গ্রহণ করা হয়েছে" },
  { value: ServiceRequestStatus.ASSIGNED, label: "বরাদ্দ" },
  { value: ServiceRequestStatus.IN_PROGRESS, label: "চলমান" },
  { value: ServiceRequestStatus.COMPLETED, label: "সম্পন্ন" },
  { value: ServiceRequestStatus.CANCELLED, label: "বাতিল" },
  { value: ServiceRequestStatus.REJECTED, label: "প্রত্যাখ্যাত" },
];

const TYPE_OPTIONS: ServiceRequestType[] = [
  ServiceRequestType.DOCTOR_HOME_VISIT,
  ServiceRequestType.EMERGENCY_DOCTOR,
  ServiceRequestType.AI_SERVICE,
  ServiceRequestType.ONLINE_CONSULTATION_LATER,
];

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

function fmtEnum(s: string): string {
  return s.replace(/_/g, " ");
}

function customerContact(c: AdminServiceRequestDto["customer"]): string {
  const phone = c.user.phone?.trim();
  const email = c.user.email?.trim();
  if (phone && email) return `${phone} · ${email}`;
  return phone || email || "—";
}

function locationCell(r: AdminServiceRequestDto): string {
  const parts = [
    r.locationText?.trim(),
    r.areaId ? `এলাকা:${shortId(r.areaId)}` : null,
    r.villageId ? `গ্রাম:${shortId(r.villageId)}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

function animalLabel(r: AdminServiceRequestDto): string {
  const a = r.animal;
  if (!a) return "—";
  const type = a.animalType ? fmtEnum(a.animalType) : null;
  return [a.name, a.species, type].filter(Boolean).join(" · ");
}

function assignmentSummary(r: AdminServiceRequestDto): string {
  const d = r.assignedDoctor?.displayName?.trim();
  const t = r.assignedTechnician?.displayName?.trim();
  const parts: string[] = [];
  if (d) {
    parts.push(`ডাঃ ${d.length > 32 ? `${d.slice(0, 32)}…` : d}`);
  }
  if (t) {
    parts.push(`এআই ${t.length > 32 ? `${t.slice(0, 32)}…` : t}`);
  }
  if (parts.length) return parts.join(" · ");
  return "নির্ধারিত নয়";
}

export function ServiceRequestsList() {
  const [requests, setRequests] = useState<AdminServiceRequestDto[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draftType, setDraftType] = useState("");
  const [draftArea, setDraftArea] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [appliedType, setAppliedType] = useState("");
  const [appliedArea, setAppliedArea] = useState("");
  const [areas, setAreas] = useState<AdminAreaRow[]>([]);

  const loadAreas = useCallback(async () => {
    try {
      const data = await readAdminJson<{ areas: AdminAreaRow[] }>(
        await adminFetch("/api/admin/areas?limit=500&isActive=true"),
      );
      setAreas(data.areas);
    } catch {
      setAreas([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void loadAreas();
  }, [loadAreas]);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      if (appliedStatus) params.set("status", appliedStatus);
      if (appliedType) params.set("serviceType", appliedType);
      if (appliedArea) params.set("areaId", appliedArea);

      const data = await readAdminJson<{
        requests: AdminServiceRequestDto[];
        total: number;
      }>(await adminFetch(`/api/admin/service-requests?${params.toString()}`));

      setRequests(data.requests);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load requests");
      setRequests([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [offset, appliedStatus, appliedType, appliedArea]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void loadList();
  }, [loadList]);

  function applySecondaryFilters(e: React.FormEvent) {
    e.preventDefault();
    setAppliedType(draftType);
    setAppliedArea(draftArea);
    setOffset(0);
  }

  function resetSecondaryFilters() {
    setDraftType("");
    setDraftArea("");
    setAppliedType("");
    setAppliedArea("");
    setOffset(0);
  }

  function selectStatusTab(value: "" | ServiceRequestStatus) {
    setAppliedStatus(value);
    setOffset(0);
  }

  const end = Math.min(offset + requests.length, total);
  const hasPrev = offset > 0;
  const hasNext = offset + PAGE_SIZE < total;

  const showInitialLoading = loading && requests.length === 0;
  const showEmpty = !loading && !error && requests.length === 0;

  const tableToolbar = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {loading && requests.length > 0
          ? "লোড হচ্ছে…"
          : total === 0
            ? "কোনো সেবা অনুরোধ নেই।"
            : `${offset + 1}–${end} / মোট ${total}`}
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
        title="স্ট্যাটাস অনুযায়ী"
        description="ট্যাব বেছে নিন; নিচে সেবার ধরন ও এলাকা দিয়ে সরু করতে পারবেন।"
      >
        <div
          className="-m-1 flex flex-wrap gap-1"
          role="tablist"
          aria-label="সেবা অনুরোধ স্ট্যাটাস"
        >
          {STATUS_TABS.map((tab) => {
            const active =
              tab.value === ""
                ? appliedStatus === ""
                : appliedStatus === tab.value;
            return (
              <AdminActionButton
                key={tab.value || "all"}
                type="button"
                variant={active ? "primary" : "secondary"}
                className="h-auto min-h-0 px-3 py-1.5 text-xs sm:text-sm"
                onClick={() => selectStatusTab(tab.value)}
              >
                {tab.label}
              </AdminActionButton>
            );
          })}
        </div>
      </AdminFormSection>

      <AdminFormSection
        title="অতিরিক্ত ফিল্টার"
        description="সেবার ধরন ও এলাকা (ঐচ্ছিক)।"
      >
        <form onSubmit={applySecondaryFilters} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              সেবার ধরন
              <select
                value={draftType}
                onChange={(ev) => setDraftType(ev.target.value)}
                className={inputClassName()}
              >
                <option value="">সব</option>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {serviceRequestTypeBn(t)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              এলাকা
              <select
                value={draftArea}
                onChange={(ev) => setDraftArea(ev.target.value)}
                className={inputClassName()}
              >
                <option value="">সব</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nameBn?.trim() || a.name} ({fmtEnum(a.type)})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminActionButton type="submit" variant="primary">
              ফিল্টার প্রয়োগ
            </AdminActionButton>
            <AdminActionButton
              type="button"
              variant="secondary"
              onClick={resetSecondaryFilters}
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
        <AdminLoadingState message="সেবা অনুরোধ লোড হচ্ছে…" />
      ) : null}

      {showEmpty ? (
        <AdminEmptyState
          title="কোনো সেবা অনুরোধ নেই"
          description="এই ফিল্টারে কিছু মেলেনি। স্ট্যাটাস বা ফিল্টার বদলে দেখুন।"
        />
      ) : null}

      {!error && !showInitialLoading && !showEmpty ? (
        <AdminTable toolbar={tableToolbar}>
          <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-3">আইডি</th>
              <th className="px-3 py-3">গ্রাহক</th>
              <th className="px-3 py-3">ফোন / ইমেইল</th>
              <th className="px-3 py-3">পশু</th>
              <th className="px-3 py-3">সেবা</th>
              <th className="px-3 py-3">সমস্যা</th>
              <th className="px-3 py-3">এলাকা / অবস্থান</th>
              <th className="px-3 py-3">পছন্দের সময়</th>
              <th className="px-3 py-3">স্ট্যাটাস</th>
              <th className="px-3 py-3">নির্ধারিত</th>
              <th className="px-3 py-3">তৈরি</th>
              <th className="px-3 py-3 text-end">কাজ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
            {requests.map((r) => {
              const problem =
                r.problemOrSymptom && r.problemOrSymptom.length > 72
                  ? `${r.problemOrSymptom.slice(0, 72)}…`
                  : (r.problemOrSymptom ?? "—");
              const urgent = isEmergencyServiceRequest(r);
              return (
                <tr
                  key={r.id}
                  className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                >
                  <td className="align-top px-3 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                    {shortId(r.id)}
                  </td>
                  <td className="align-top px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {r.customer.displayName}
                  </td>
                  <td className="align-top px-3 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    {customerContact(r.customer)}
                  </td>
                  <td className="align-top px-3 py-3 text-zinc-700 dark:text-zinc-300">
                    {animalLabel(r)}
                  </td>
                  <td className="align-top px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <AdminBadge variant="neutral" className="w-fit font-normal">
                        {serviceRequestTypeBn(r.serviceType)}
                      </AdminBadge>
                      {urgent ? (
                        <AdminBadge variant="danger" className="w-fit font-normal">
                          জরুরি
                        </AdminBadge>
                      ) : null}
                    </div>
                  </td>
                  <td className="align-top px-3 py-3 text-zinc-700 dark:text-zinc-300">
                    {problem}
                  </td>
                  <td className="align-top px-3 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                    {locationCell(r)}
                  </td>
                  <td className="align-top px-3 py-3 text-zinc-700 dark:text-zinc-300">
                    {r.preferredTime?.trim() || "—"}
                  </td>
                  <td className="align-top px-3 py-3">
                    <AdminBadge
                      variant={serviceRequestStatusBadgeVariant(r.status)}
                    >
                      {serviceRequestStatusBn(r.status)}
                    </AdminBadge>
                  </td>
                  <td className="max-w-[220px] align-top px-3 py-3 text-xs leading-snug text-zinc-700 dark:text-zinc-300">
                    {assignmentSummary(r)}
                  </td>
                  <td className="align-top whitespace-nowrap px-3 py-3 text-zinc-700 dark:text-zinc-300">
                    {format(parseISO(r.createdAt), "yyyy-MM-dd HH:mm")}
                  </td>
                  <td className="align-top px-3 py-3 text-end">
                    <AdminActionButton
                      href={`/admin/service-requests/${r.id}`}
                      variant="secondary"
                      className="h-auto min-h-0 px-2 py-1 text-xs"
                    >
                      দেখুন
                    </AdminActionButton>
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
