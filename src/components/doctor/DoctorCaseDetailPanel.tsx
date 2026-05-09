"use client";

import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DoctorCaseClinicalSection } from "@/components/doctor/DoctorCaseClinicalSection";
import { doctorFetch } from "@/lib/doctor/doctor-fetch";
import { readDoctorJson } from "@/lib/doctor/read-doctor-json";
import type { DoctorServiceRequestDetailDto } from "@/lib/doctor-service-requests/doctor-service-request-service";
import { DOCTOR_CASE_COMPLETABLE_STATUSES } from "@/lib/doctor-service-requests/clinical-constants";
import { cn } from "@/lib/cn";
import { PaymentMethod, PaymentStatus, ServiceRequestStatus } from "@/generated/prisma/browser";

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

type DetailPayload = { request: DoctorServiceRequestDetailDto };

type CompletePayload = DetailPayload & {
  billing?: unknown;
};

type ActionMeta = {
  alreadyAccepted?: boolean;
  alreadyRejected?: boolean;
  alreadyCompleted?: boolean;
};

const MVP_PAYMENT_METHODS: PaymentMethod[] = [
  PaymentMethod.CASH,
  PaymentMethod.BKASH,
  PaymentMethod.NAGAD,
  PaymentMethod.ROCKET,
  PaymentMethod.BANK,
  PaymentMethod.OTHER,
];

const MVP_PAYMENT_STATUSES: PaymentStatus[] = [
  PaymentStatus.UNPAID,
  PaymentStatus.PARTIAL,
  PaymentStatus.PAID,
  PaymentStatus.REFUNDED,
  PaymentStatus.CANCELLED,
];

function parseOptionalNonNegativeMoney(raw: string): number | null {
  const t = raw.trim();
  if (!t) return 0;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function DoctorCaseDetailPanel({ requestId }: { requestId: string }) {
  const [row, setRow] = useState<DoctorServiceRequestDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [completeOpen, setCompleteOpen] = useState(false);
  const [billServiceFee, setBillServiceFee] = useState("");
  const [billTravel, setBillTravel] = useState("");
  const [billMedicine, setBillMedicine] = useState("");
  const [billDiscount, setBillDiscount] = useState("");
  const [billMethod, setBillMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [billPayStatus, setBillPayStatus] = useState<PaymentStatus>(
    PaymentStatus.UNPAID,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorFetch(`/api/doctor/service-requests/${requestId}`);
      if (res.status === 404) {
        setRow(null);
        setError(
          "This case was not found or is not assigned to you. It may have been reassigned.",
        );
        return;
      }
      const data = await readDoctorJson<DetailPayload>(res);
      setRow(data.request);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load case");
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void load();
  }, [load]);

  async function onAccept() {
    setActionError(null);
    setBusy(true);
    try {
      const res = await doctorFetch(
        `/api/doctor/service-requests/${requestId}/accept`,
        { method: "POST", headers: { "Content-Type": "application/json" } },
      );
      const body = (await res.json()) as
        | { ok: true; data: DetailPayload & { meta?: ActionMeta } }
        | { ok: false; error?: { message?: string } };

      if (!res.ok || !body.ok) {
        setActionError(body.ok === false ? body.error?.message ?? "Request failed" : "Request failed");
        return;
      }
      setRow(body.data.request);
    } catch {
      setActionError("Could not accept request");
    } finally {
      setBusy(false);
    }
  }

  async function onReject() {
    setActionError(null);
    setBusy(true);
    try {
      const res = await doctorFetch(
        `/api/doctor/service-requests/${requestId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: rejectReason.trim() || undefined,
          }),
        },
      );
      const body = (await res.json()) as
        | { ok: true; data: DetailPayload & { meta?: ActionMeta } }
        | { ok: false; error?: { message?: string } };

      if (!res.ok || !body.ok) {
        setActionError(body.ok === false ? body.error?.message ?? "Request failed" : "Request failed");
        return;
      }
      setRow(body.data.request);
      setRejectOpen(false);
      setRejectReason("");
    } catch {
      setActionError("Could not reject request");
    } finally {
      setBusy(false);
    }
  }

  async function onCompleteCase() {
    setActionError(null);
    const sf = Number(billServiceFee.trim());
    if (!Number.isFinite(sf) || sf < 0) {
      setActionError("Enter a valid service fee (0 or more).");
      return;
    }
    const travelCost = parseOptionalNonNegativeMoney(billTravel);
    const medicineCost = parseOptionalNonNegativeMoney(billMedicine);
    const discount = parseOptionalNonNegativeMoney(billDiscount);
    if (travelCost === null || medicineCost === null || discount === null) {
      setActionError("Travel, medicine, and discount must be blank or valid amounts (≥ 0).");
      return;
    }

    setBusy(true);
    try {
      const res = await doctorFetch(
        `/api/doctor/service-requests/${requestId}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceFee: sf,
            travelCost,
            medicineCost,
            discount,
            paymentMethod: billMethod,
            paymentStatus: billPayStatus,
          }),
        },
      );
      const body = (await res.json()) as
        | { ok: true; data: CompletePayload & { meta?: ActionMeta } }
        | { ok: false; error?: { code?: string; message?: string } };

      if (!res.ok || !body.ok) {
        if (res.status === 404) {
          setActionError(
            "This case was not found or is not assigned to you. You may not have permission to complete it.",
          );
          return;
        }
        setActionError(
          body.ok === false ? body.error?.message ?? "Request failed" : "Request failed",
        );
        return;
      }
      setRow(body.data.request);
      setCompleteOpen(false);
    } catch {
      setActionError("Could not complete case");
    } finally {
      setBusy(false);
    }
  }

  const canAccept = row?.status === ServiceRequestStatus.ASSIGNED;
  const canReject =
    row &&
    (row.status === ServiceRequestStatus.ASSIGNED ||
      row.status === ServiceRequestStatus.ACCEPTED);

  const hasTreatmentNote = (row?.treatments.length ?? 0) > 0;
  const canCompleteCase =
    row &&
    DOCTOR_CASE_COMPLETABLE_STATUSES.includes(
      row.status as ServiceRequestStatus,
    ) &&
    hasTreatmentNote;

  const isCompleted = row?.status === ServiceRequestStatus.COMPLETED;

  if (loading) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading case…</p>
    );
  }

  if (error && !row) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {error}
        </div>
        <Link
          href="/doctor/requests/new"
          className="inline-flex text-sm font-medium text-teal-800 underline-offset-2 hover:underline dark:text-teal-400"
        >
          ← Back to requests
        </Link>
      </div>
    );
  }

  if (!row) return null;

  const animal = row.animal;
  const customer = row.customer;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Case
          </p>
          <h2 className="mt-1 font-mono text-sm text-zinc-800 dark:text-zinc-200">
            {row.id}
          </h2>
          <p className="mt-2">
            <span className="inline-flex rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-900 dark:bg-teal-950/60 dark:text-teal-100">
              {fmtEnum(row.status)}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canAccept ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onAccept()}
              className={cn(
                "rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white",
                "hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              Accept request
            </button>
          ) : null}
          {canReject ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => setRejectOpen(true)}
              className={cn(
                "rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800",
                "hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60",
                "dark:border-red-900 dark:bg-zinc-900 dark:text-red-200 dark:hover:bg-red-950/40",
              )}
            >
              Reject
            </button>
          ) : null}
          {canCompleteCase ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => setCompleteOpen(true)}
              className={cn(
                "rounded-lg border border-teal-600 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-900",
                "hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60",
                "dark:border-teal-700 dark:bg-teal-950/50 dark:text-teal-100 dark:hover:bg-teal-900/40",
              )}
            >
              Complete case
            </button>
          ) : null}
        </div>
      </div>

      {isCompleted ? (
        <div
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
          role="status"
        >
          <p className="font-semibold">Case completed</p>
          <p className="mt-1 text-emerald-900/90 dark:text-emerald-200/90">
            This request is closed. You cannot add new treatment notes or prescriptions. Saved
            records remain visible in the sections below.
          </p>
          {row.completedAt ? (
            <p className="mt-2 text-xs text-emerald-800 dark:text-emerald-300/90">
              Completed at {fmtIso(row.completedAt)}
            </p>
          ) : null}
        </div>
      ) : null}

      {row &&
      DOCTOR_CASE_COMPLETABLE_STATUSES.includes(row.status as ServiceRequestStatus) &&
      !hasTreatmentNote ? (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Save at least one treatment note below before you can mark this case complete.
        </p>
      ) : null}

      {actionError ? (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
          role="alert"
        >
          {actionError}
        </div>
      ) : null}

      {rejectOpen ? (
        <div
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          role="dialog"
          aria-labelledby="reject-title"
        >
          <h3 id="reject-title" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Reject this request
          </h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Optional note (stored for operations; customer contact details are not shown here).
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            maxLength={2000}
            className={cn(
              "mt-3 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm",
              "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
            )}
            placeholder="Reason (optional)"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onReject()}
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
            >
              Confirm reject
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setRejectOpen(false);
                setRejectReason("");
              }}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {completeOpen ? (
        <div
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          role="dialog"
          aria-labelledby="complete-title"
        >
          <h3
            id="complete-title"
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Complete this case?
          </h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Enter billing for this visit. The request will move to <strong>completed</strong> and the
            customer will see it in their history. You cannot add new treatment notes or prescriptions
            after completion.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Service fee (BDT) *
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                required
                value={billServiceFee}
                onChange={(e) => setBillServiceFee(e.target.value)}
                className={cn(
                  "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm",
                  "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
                )}
              />
            </label>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Travel cost (BDT)
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={billTravel}
                onChange={(e) => setBillTravel(e.target.value)}
                className={cn(
                  "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm",
                  "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
                )}
              />
            </label>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Medicine cost (BDT)
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={billMedicine}
                onChange={(e) => setBillMedicine(e.target.value)}
                className={cn(
                  "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm",
                  "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
                )}
              />
            </label>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Discount (BDT)
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={billDiscount}
                onChange={(e) => setBillDiscount(e.target.value)}
                className={cn(
                  "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm",
                  "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
                )}
              />
            </label>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Payment method
              <select
                value={billMethod}
                onChange={(e) => setBillMethod(e.target.value as PaymentMethod)}
                className={cn(
                  "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm",
                  "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
                )}
              >
                {MVP_PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {fmtEnum(m)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Payment status
              <select
                value={billPayStatus}
                onChange={(e) => setBillPayStatus(e.target.value as PaymentStatus)}
                className={cn(
                  "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm",
                  "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
                )}
              >
                {MVP_PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {fmtEnum(s)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onCompleteCase()}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              Yes, complete case
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setCompleteOpen(false)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <section>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Customer
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          Name only — phone and email are hidden on the doctor panel for privacy.
        </p>
        <dl className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Display name
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {customer.displayName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Customer ID
            </dt>
            <dd className="mt-0.5 font-mono text-xs text-zinc-700 dark:text-zinc-300">
              {customer.id}
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Animal
        </h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Name
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{animal.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Species / type
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {[animal.species, animal.animalType ? fmtEnum(animal.animalType) : null]
                .filter(Boolean)
                .join(" · ") || "—"}
            </dd>
          </div>
          {animal.breed ? (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Breed
              </dt>
              <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{animal.breed}</dd>
            </div>
          ) : null}
          {animal.weightKg ? (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Weight (kg)
              </dt>
              <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{animal.weightKg}</dd>
            </div>
          ) : null}
          {animal.notes?.trim() ? (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Animal notes
              </dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                {animal.notes.trim()}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Request
        </h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Service type
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {fmtEnum(row.serviceType)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Category
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {row.serviceCategory?.name ?? "—"}
            </dd>
          </div>
          {row.isEmergency ? (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-red-600">
                Emergency
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-red-800 dark:text-red-200">
                Yes
                {row.emergencyNotes?.trim() ? (
                  <span className="mt-1 block whitespace-pre-wrap font-normal text-zinc-800 dark:text-zinc-200">
                    {row.emergencyNotes.trim()}
                  </span>
                ) : null}
              </dd>
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Problem / symptom
            </dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
              {row.problemOrSymptom?.trim() || "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Description
            </dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
              {row.description?.trim() || "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Area / location
            </dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
              {[
                row.locationText?.trim(),
                row.areaId ? `Area ID: ${row.areaId}` : null,
                row.villageId ? `Village ID: ${row.villageId}` : null,
              ]
                .filter(Boolean)
                .join("\n") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Preferred time
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {row.preferredTime?.trim() || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Urgency
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {row.urgency?.trim() || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Assigned doctor
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {row.assignedDoctor?.displayName?.trim() || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Assigned technician
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {row.assignedTechnician?.displayName?.trim() || "—"}
            </dd>
          </div>
          {row.cancelReason?.trim() ? (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Cancellation / rejection note
              </dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                {row.cancelReason.trim()}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Submitted
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {fmtIso(row.submittedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Updated
            </dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {fmtIso(row.updatedAt)}
            </dd>
          </div>
        </dl>
      </section>

      {row.billing ? (
        <section>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Billing</h2>
          <p className="mt-1 text-xs text-zinc-500">Amounts after platform commission (BDT).</p>
          <dl className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Total collected
              </dt>
              <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                {row.billing.totalCollected.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Your payout (est.)
              </dt>
              <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                {row.billing.providerPayout.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Payment
              </dt>
              <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                {fmtEnum(row.billing.paymentMethod)} · {fmtEnum(row.billing.paymentStatus)}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      <DoctorCaseClinicalSection
        requestId={requestId}
        row={row}
        onSaved={() => void load()}
      />

      <Link
        href="/doctor/requests/new"
        className="inline-flex text-sm font-medium text-teal-800 underline-offset-2 hover:underline dark:text-teal-400"
      >
        ← Back to requests
      </Link>
    </div>
  );
}
