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
import type { AdminDoctorDetail } from "@/types/admin-doctors";

import {
  doctorVerificationBn,
  providerStatusBadgeVariant,
  providerStatusBn,
  userStatusBadgeVariant,
  userStatusBn,
  verificationBadgeVariant,
} from "./doctor-labels";

function fmtFee(bdt: string | null): string {
  if (bdt == null || bdt === "") return "—";
  const n = Number(bdt);
  if (!Number.isFinite(n)) return bdt;
  return `৳${n.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

export function DoctorDetailPanel({ doctorId }: { doctorId: string }) {
  const router = useRouter();
  const [doctor, setDoctor] = useState<AdminDoctorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutating, setMutating] = useState<string | null>(null);
  const [loadRetryKey, setLoadRetryKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{ doctor: AdminDoctorDetail }>(
        await adminFetch(`/api/admin/doctors/${doctorId}`),
      );
      setDoctor(data.doctor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load doctor");
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void load();
  }, [load, loadRetryKey]);

  async function postAction(path: string, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setMutating(path);
    setError(null);
    try {
      await readAdminJson<{ doctor: AdminDoctorDetail }>(
        await adminFetch(`/api/admin/doctors/${doctorId}/${path}`, {
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
    return <AdminLoadingState message="ডাক্তারের প্রোফাইল লোড হচ্ছে…" />;
  }

  if (error && !doctor) {
    return (
      <div className="space-y-4">
        <AdminErrorState
          message={error}
          onRetry={() => setLoadRetryKey((k) => k + 1)}
        />
        <AdminActionButton href="/admin/doctors" variant="secondary">
          ← ডাক্তার তালিকা
        </AdminActionButton>
      </div>
    );
  }

  if (!doctor) return null;

  const photoSrc = doctor.profilePhotoUrl?.trim();
  const showImg =
    photoSrc &&
    (photoSrc.startsWith("http://") ||
      photoSrc.startsWith("https://") ||
      photoSrc.startsWith("/"));

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
        title="ডাক্তার"
        description={`${doctor.user.email} · ${doctor.user.phone ?? "ফোন নেই"}`}
      >
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="shrink-0">
            {showImg ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin URL from stored profile
              <img
                src={photoSrc}
                alt=""
                className="h-36 w-36 rounded-xl border border-zinc-200 object-cover dark:border-zinc-700"
              />
            ) : (
              <div className="flex h-36 w-36 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-center text-xs text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                ছবি নেই
                <br />
                URL সেট
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {doctor.displayName ?? "—"}
            </h2>
            <div className="flex flex-wrap gap-2">
              <AdminBadge variant={userStatusBadgeVariant(doctor.user.status)}>
                অ্যাকাউন্ট: {userStatusBn(doctor.user.status)}
              </AdminBadge>
              <AdminBadge variant={providerStatusBadgeVariant(doctor.providerStatus)}>
                প্রোভাইডার: {providerStatusBn(doctor.providerStatus)}
              </AdminBadge>
              <AdminBadge variant={verificationBadgeVariant(doctor.verificationSummary)}>
                {doctorVerificationBn(doctor.verificationSummary)}
              </AdminBadge>
            </div>
          </div>
        </div>
      </AdminFormSection>

      <AdminFormSection title="পেশাগত তথ্য" description="ডিগ্রি, লাইসেন্স, ভিজিট ফি ও অভিজ্ঞতা।">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              ডিগ্রি
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {doctor.degree ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              লাইসেন্স
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {doctor.licenseNumber}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              বিশেষতা
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {doctor.specialization ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              অভিজ্ঞতা (বছর)
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {doctor.experienceYears ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              ভিজিট ফি
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {fmtFee(doctor.visitFeeBdt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              যাচাইকৃত সময়
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {doctor.verifiedAt
                ? format(new Date(doctor.verifiedAt), "PPp")
                : "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              জরুরি সেবা / অনলাইন
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              জরুরি: {doctor.acceptsEmergency ? "হ্যাঁ" : "না"} · অনলাইন পরামর্শ:{" "}
              {doctor.acceptsOnlineConsultation ? "হ্যাঁ" : "না"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              পরিচিতি
            </dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
              {doctor.bio ?? "—"}
            </dd>
          </div>
        </dl>
      </AdminFormSection>

      <AdminFormSection title="সার্ভিস এলাকা" description="কাজের এলাকা (এরিয়া ট্রি)।">
        <ul className="list-inside list-disc text-sm text-zinc-700 dark:text-zinc-300">
          {doctor.workingAreas.length === 0 ? (
            <li className="list-none text-zinc-500">কোনো এলাকা বরাদ্দ নেই</li>
          ) : (
            doctor.workingAreas.map((w) => (
              <li key={w.id}>
                {w.area.name}
                {w.area.nameBn ? ` (${w.area.nameBn})` : ""}
                <span className="text-zinc-400"> · {w.area.type}</span>
              </li>
            ))
          )}
        </ul>
      </AdminFormSection>

      <AdminFormSection title="সেবা বিভাগ" description="নির্বাচিত সেবা ক্যাটাগরি।">
        <ul className="list-inside list-disc text-sm text-zinc-700 dark:text-zinc-300">
          {doctor.serviceCategories.length === 0 ? (
            <li className="list-none text-zinc-500">কোনো বিভাগ নেই</li>
          ) : (
            doctor.serviceCategories.map((c) => (
              <li key={c.id}>{c.serviceCategory.name}</li>
            ))
          )}
        </ul>
      </AdminFormSection>

      <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <AdminActionButton href={`/admin/doctors/${doctorId}/edit`} variant="secondary">
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
              "এই ডাক্তার প্রত্যাখ্যান করবেন? প্রোভাইডার প্রত্যাখ্যাত ও অ্যাকাউন্ট সাসপেন্ড হবে।",
            )
          }
        >
          {mutating === "reject" ? "…" : "প্রত্যাখ্যান"}
        </AdminActionButton>
        <AdminActionButton
          type="button"
          variant="secondary"
          className="border-0 bg-zinc-700 text-white hover:bg-zinc-800"
          disabled={mutating === "suspend"}
          onClick={() =>
            void postAction(
              "suspend",
              "এই ডাক্তার সাসপেন্ড করবেন? পুনরায় সক্রিয় না হওয়া পর্যন্ত ব্লক থাকবেন।",
            )
          }
        >
          {mutating === "suspend" ? "…" : "সাসপেন্ড"}
        </AdminActionButton>
      </div>
    </div>
  );
}
