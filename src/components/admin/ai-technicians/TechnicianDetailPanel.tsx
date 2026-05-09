"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import type { AdminTechnicianDetail } from "@/types/admin-ai-technicians";

import {
  doctorVerificationBn,
  providerStatusBadgeVariant,
  providerStatusBn,
  userStatusBadgeVariant,
  userStatusBn,
  verificationBadgeVariant,
} from "./technician-labels";

function fmtFee(bdt: string | null): string {
  if (bdt == null || bdt === "") return "—";
  const n = Number(bdt);
  if (!Number.isFinite(n)) return bdt;
  return `৳${n.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

export function TechnicianDetailPanel({
  technicianId,
}: {
  technicianId: string;
}) {
  const router = useRouter();
  const [technician, setTechnician] = useState<AdminTechnicianDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutating, setMutating] = useState<string | null>(null);
  const [loadRetryKey, setLoadRetryKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{ technician: AdminTechnicianDetail }>(
        await adminFetch(`/api/admin/ai-technicians/${technicianId}`),
      );
      setTechnician(data.technician);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load technician");
      setTechnician(null);
    } finally {
      setLoading(false);
    }
  }, [technicianId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void load();
  }, [load, loadRetryKey]);

  async function postAction(path: string, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setMutating(path);
    setError(null);
    try {
      await readAdminJson<{ technician: AdminTechnicianDetail }>(
        await adminFetch(`/api/admin/ai-technicians/${technicianId}/${path}`, {
          method: "POST",
        }),
      );
      await load();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setMutating(null);
    }
  }

  if (loading) {
    return (
      <AdminLoadingState message="এআই টেকনিশিয়ান প্রোফাইল লোড হচ্ছে…" />
    );
  }

  if (error && !technician) {
    return (
      <div className="space-y-4">
        <AdminErrorState
          message={error}
          onRetry={() => setLoadRetryKey((k) => k + 1)}
        />
        <AdminActionButton href="/admin/ai-technicians" variant="secondary">
          ← এআই টেকনিশিয়ান তালিকা
        </AdminActionButton>
      </div>
    );
  }

  if (!technician) return null;

  const metaStr =
    technician.metadataJson != null
      ? JSON.stringify(technician.metadataJson, null, 2)
      : "—";

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
        title="এআই টেকনিশিয়ান"
        description={`${technician.user.email} · ${technician.user.phone ?? "ফোন নেই"}`}
      >
        <div className="min-w-0 space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {technician.displayName ?? "—"}
          </h2>
          <div className="flex flex-wrap gap-2">
            <AdminBadge variant={userStatusBadgeVariant(technician.user.status)}>
              অ্যাকাউন্ট: {userStatusBn(technician.user.status)}
            </AdminBadge>
            <AdminBadge
              variant={providerStatusBadgeVariant(technician.providerStatus)}
            >
              প্রোভাইডার: {providerStatusBn(technician.providerStatus)}
            </AdminBadge>
            <AdminBadge
              variant={verificationBadgeVariant(technician.verificationSummary)}
            >
              {doctorVerificationBn(technician.verificationSummary)}
            </AdminBadge>
          </div>
        </div>
      </AdminFormSection>

      <AdminFormSection
        title="পেশাগত তথ্য"
        description="সার্টিফিকেট, সেবা ফি, জরুরি মাঠে উপলব্ধতা।"
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              সার্টিফিকেট / নিবন্ধন
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {technician.certification ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              সেবা ফি (BDT)
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {fmtFee(technician.serviceFeeBdt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              যাচাইকৃত সময়
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {technician.verifiedAt
                ? format(new Date(technician.verifiedAt), "PPp")
                : "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              জরুরি মাঠ সেবা
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {technician.acceptsEmergency ? "হ্যাঁ" : "না"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              পরিচিতি
            </dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
              {technician.bio ?? "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              মেটাডেটা (জাত / সিমেন ট্যাগ, MVP JSON)
            </dt>
            <dd className="mt-0.5">
              <pre className="max-h-40 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                {metaStr}
              </pre>
            </dd>
          </div>
        </dl>
      </AdminFormSection>

      <AdminFormSection
        title="সার্ভিস এলাকা (এরিয়া ট্রি)"
        description="কাজের এলাকা — এলাকা ব্যবস্থাপনা থেকে।"
      >
        {technician.workingAreas.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            কোনো এলাকা বরাদ্দ নেই।
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {technician.workingAreas.map((w) => (
              <li key={w.id}>
                <AdminBadge variant="neutral" className="font-normal">
                  {w.area.name}
                  {w.area.nameBn ? ` (${w.area.nameBn})` : ""}
                  <span className="text-zinc-500"> · {w.area.type}</span>
                </AdminBadge>
              </li>
            ))}
          </ul>
        )}
      </AdminFormSection>

      <AdminFormSection
        title="গ্রাম সার্ভিস এলাকা"
        description="স্ট্যান্ডার্ড ভৌগোলিক হায়ারার্কি।"
      >
        {technician.villageServiceAreas.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            কোনো গ্রাম বরাদ্দ নেই।
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {technician.villageServiceAreas.map((v) => (
              <li key={v.id}>
                <AdminBadge variant="neutral" className="inline-block font-normal">
                  {v.village.name}
                  <span className="text-zinc-500">
                    {" "}
                    · {v.village.union.upazila.district.division.name} →{" "}
                    {v.village.union.upazila.district.name} →{" "}
                    {v.village.union.upazila.name}
                  </span>
                </AdminBadge>
              </li>
            ))}
          </ul>
        )}
      </AdminFormSection>

      <AdminFormSection
        title="সেবা বিভাগ"
        description="কৃত্রিম প্রজনন ও সংশ্লিষ্ট সেবা — ক্যাটালগ থেকে বেছে নেওয়া।"
      >
        {technician.serviceCategories.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            কোনো বিভাগ বরাদ্দ নেই।
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {technician.serviceCategories.map((c) => (
              <li key={c.id}>
                <AdminBadge variant="neutral" className="font-normal">
                  {c.serviceCategory.name}
                </AdminBadge>
              </li>
            ))}
          </ul>
        )}
      </AdminFormSection>

      <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <AdminActionButton
          href={`/admin/ai-technicians/${technicianId}/edit`}
          variant="primary"
        >
          সম্পাদনা
        </AdminActionButton>
        <AdminActionButton
          type="button"
          variant="primary"
          disabled={mutating === "approve"}
          onClick={() => void postAction("approve")}
        >
          {mutating === "approve" ? "…" : "অনুমোদন"}
        </AdminActionButton>
        <AdminActionButton
          type="button"
          variant="secondary"
          className="border-0 bg-sky-700 text-white hover:bg-sky-800"
          disabled={mutating === "verify"}
          onClick={() => void postAction("verify")}
        >
          {mutating === "verify" ? "…" : "যাচাই"}
        </AdminActionButton>
        <AdminActionButton
          type="button"
          variant="secondary"
          disabled={mutating === "activate"}
          onClick={() => void postAction("activate")}
        >
          {mutating === "activate" ? "…" : "সক্রিয়"}
        </AdminActionButton>
        <AdminActionButton
          type="button"
          variant="danger"
          disabled={mutating === "reject"}
          onClick={() =>
            void postAction(
              "reject",
              "এই এআই টেকনিশিয়ান প্রত্যাখ্যান করবেন? প্রোভাইডার প্রত্যাখ্যাত ও অ্যাকাউন্ট সাসপেন্ড হবে।",
            )
          }
        >
          {mutating === "reject" ? "…" : "প্রত্যাখ্যান"}
        </AdminActionButton>
        <AdminActionButton
          type="button"
          variant="secondary"
          className="bg-zinc-700 text-white hover:bg-zinc-800"
          disabled={mutating === "suspend"}
          onClick={() =>
            void postAction(
              "suspend",
              "এই এআই টেকনিশিয়ান সাসপেন্ড করবেন? পুনরায় সক্রিয় না হওয়া পর্যন্ত ব্লক থাকবেন।",
            )
          }
        >
          {mutating === "suspend" ? "…" : "সাসপেন্ড"}
        </AdminActionButton>
      </div>
    </div>
  );
}
