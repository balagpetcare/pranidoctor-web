"use client";

import { format, parseISO } from "date-fns";
import { useCallback, useMemo, useState } from "react";

import { doctorFetch } from "@/lib/doctor/doctor-fetch";
import type { DoctorServiceRequestDetailDto } from "@/lib/doctor-service-requests/doctor-service-request-service";
import { DOCTOR_CLINICAL_REQUEST_STATUSES } from "@/lib/doctor-service-requests/clinical-constants";
import { cn } from "@/lib/cn";
import {
  SERVICE_REQUEST_STATUS,
  type ServiceRequestStatus,
} from "@/lib/domain/service-request-constants";

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

function inputClass(): string {
  return cn(
    "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
    "outline-none ring-teal-600/30 focus:border-teal-600 focus:ring-2",
    "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  );
}

type RxLine = {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instruction: string;
  note: string;
  quantity: string;
};

const emptyRxLine = (): RxLine => ({
  medicineName: "",
  dosage: "",
  frequency: "",
  duration: "",
  instruction: "",
  note: "",
  quantity: "",
});

type ClinicalTreatmentRow = {
  id: string;
  status: string;
  diagnosis?: string | null;
  symptoms?: string | null;
  treatmentNotes?: string | null;
  followUpNotes?: string | null;
  followUpDate?: string | null;
  recordedAt?: string | null;
};

type ClinicalPrescriptionItemRow = {
  id: string;
  medicineName: string;
  dosage?: string | null;
  duration?: string | null;
  instruction?: string | null;
};

type ClinicalPrescriptionRow = {
  id: string;
  createdAt?: string | null;
  instructions?: string | null;
  validUntil?: string | null;
  items: ClinicalPrescriptionItemRow[];
};

type Props = {
  requestId: string;
  row: DoctorServiceRequestDetailDto;
  onSaved: () => void;
};

export function DoctorCaseClinicalSection({ requestId, row, onSaved }: Props) {
  const canEdit = useMemo(
    () =>
      DOCTOR_CLINICAL_REQUEST_STATUSES.includes(
        row.status as ServiceRequestStatus,
      ),
    [row.status],
  );

  const [clinicalError, setClinicalError] = useState<string | null>(null);
  const [savingTreatment, setSavingTreatment] = useState(false);
  const [savingRx, setSavingRx] = useState(false);

  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [treatmentNotes, setTreatmentNotes] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [procedures, setProcedures] = useState("");

  const [rxLines, setRxLines] = useState<RxLine[]>([emptyRxLine()]);
  const [rxInstructions, setRxInstructions] = useState("");
  const [rxValidUntil, setRxValidUntil] = useState("");

  const resetTreatment = useCallback(() => {
    setDiagnosis("");
    setSymptoms("");
    setTreatmentNotes("");
    setFollowUpNotes("");
    setFollowUpDate("");
    setChiefComplaint("");
    setProcedures("");
  }, []);

  const resetRx = useCallback(() => {
    setRxLines([emptyRxLine()]);
    setRxInstructions("");
    setRxValidUntil("");
  }, []);

  async function submitTreatment() {
    setClinicalError(null);
    setSavingTreatment(true);
    try {
      const res = await doctorFetch(
        `/api/doctor/service-requests/${requestId}/treatment-cases`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chiefComplaint: chiefComplaint || undefined,
            symptoms: symptoms || undefined,
            diagnosis: diagnosis || undefined,
            procedures: procedures || undefined,
            treatmentNotes: treatmentNotes || undefined,
            followUpNotes: followUpNotes || undefined,
            followUpDate: followUpDate || undefined,
          }),
        },
      );
      const body = (await res.json()) as {
        ok: boolean;
        error?: { message?: string };
      };
      if (!res.ok || !body.ok) {
        setClinicalError(body.error?.message ?? "Could not save treatment");
        return;
      }
      resetTreatment();
      onSaved();
    } catch {
      setClinicalError("Could not save treatment");
    } finally {
      setSavingTreatment(false);
    }
  }

  async function submitPrescription() {
    setClinicalError(null);
    const items = rxLines
      .map((l) => ({
        medicineName: l.medicineName.trim(),
        dosage: l.dosage.trim() || undefined,
        frequency: l.frequency.trim() || undefined,
        duration: l.duration.trim() || undefined,
        instruction: l.instruction.trim() || undefined,
        note: l.note.trim() || undefined,
        quantity: l.quantity.trim() || undefined,
      }))
      .filter((l) => l.medicineName.length > 0);

    if (items.length === 0) {
      setClinicalError("Add at least one medicine with a name.");
      return;
    }

    setSavingRx(true);
    try {
      const res = await doctorFetch(
        `/api/doctor/service-requests/${requestId}/prescriptions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instructions: rxInstructions.trim() || undefined,
            validUntil: rxValidUntil || undefined,
            items,
          }),
        },
      );
      const body = (await res.json()) as {
        ok: boolean;
        error?: { message?: string };
      };
      if (!res.ok || !body.ok) {
        setClinicalError(body.error?.message ?? "Could not save prescription");
        return;
      }
      resetRx();
      onSaved();
    } catch {
      setClinicalError("Could not save prescription");
    } finally {
      setSavingRx(false);
    }
  }

  return (
    <section className="space-y-10 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Treatment records
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          Saved as finalized entries for this case (your assignments only).
        </p>
        {row.treatments.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            No treatment notes yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {(row.treatments as ClinicalTreatmentRow[]).map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-zinc-500">
                    {t.id.slice(0, 12)}…
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {fmtEnum(t.status)}
                  </span>
                </div>
                <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                  {t.diagnosis?.trim() ? (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-zinc-500">Diagnosis</dt>
                      <dd className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                        {t.diagnosis}
                      </dd>
                    </div>
                  ) : null}
                  {t.symptoms?.trim() ? (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-zinc-500">Symptoms / clinical</dt>
                      <dd className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                        {t.symptoms}
                      </dd>
                    </div>
                  ) : null}
                  {t.treatmentNotes?.trim() ? (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-zinc-500">Treatment notes</dt>
                      <dd className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                        {t.treatmentNotes}
                      </dd>
                    </div>
                  ) : null}
                  {t.followUpNotes?.trim() ? (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-zinc-500">Follow-up advice</dt>
                      <dd className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                        {t.followUpNotes}
                      </dd>
                    </div>
                  ) : null}
                  {t.followUpDate ? (
                    <div>
                      <dt className="text-xs font-medium text-zinc-500">Next visit</dt>
                      <dd className="text-zinc-800 dark:text-zinc-200">{fmtIso(t.followUpDate)}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-xs font-medium text-zinc-500">Recorded</dt>
                    <dd className="text-zinc-800 dark:text-zinc-200">{fmtIso(t.recordedAt)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Prescriptions
        </h2>
        {row.prescriptions.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            No prescriptions yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
            {(row.prescriptions as ClinicalPrescriptionRow[]).map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-zinc-500">
                    {p.id.slice(0, 12)}…
                  </span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {fmtIso(p.createdAt)}
                  </span>
                </div>
                {p.instructions?.trim() ? (
                  <p className="mt-2 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                    {p.instructions}
                  </p>
                ) : null}
                {p.validUntil ? (
                  <p className="mt-1 text-xs text-zinc-500">
                    Valid until: {fmtIso(p.validUntil)}
                  </p>
                ) : null}
                <ul className="mt-2 list-inside list-disc space-y-1 text-zinc-800 dark:text-zinc-200">
                  {p.items.map((i) => (
                    <li key={i.id}>
                      <span className="font-medium">{i.medicineName}</span>
                      {i.dosage ? ` — ${i.dosage}` : ""}
                      {i.duration ? ` — ${i.duration}` : ""}
                      {i.instruction ? (
                        <span className="block whitespace-pre-wrap pl-4 text-xs text-zinc-600 dark:text-zinc-400">
                          {i.instruction}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      {clinicalError ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {clinicalError}
        </div>
      ) : null}

      {!canEdit ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {row.status === SERVICE_REQUEST_STATUS.COMPLETED ? (
            <>
              This case is <strong>completed</strong>. Treatment notes and prescriptions are shown
              for reference only.
            </>
          ) : (
            <>
              Treatment notes and prescriptions can be added when the request is{" "}
              <strong>assigned</strong>, <strong>accepted</strong>, or <strong>in progress</strong>
              .
            </>
          )}
        </p>
      ) : (
        <div className="space-y-10">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Add treatment note
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Fill at least one field (diagnosis, symptoms, treatment notes, etc.).
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Chief complaint
                <textarea
                  className={inputClass()}
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                />
              </label>
              <label className="sm:col-span-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Symptoms / clinical note
                <textarea
                  className={inputClass()}
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </label>
              <label className="sm:col-span-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Diagnosis
                <textarea
                  className={inputClass()}
                  rows={2}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </label>
              <label className="sm:col-span-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Treatment note
                <textarea
                  className={inputClass()}
                  rows={3}
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                />
              </label>
              <label className="sm:col-span-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Procedures
                <textarea
                  className={inputClass()}
                  rows={2}
                  value={procedures}
                  onChange={(e) => setProcedures(e.target.value)}
                />
              </label>
              <label className="sm:col-span-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Follow-up advice
                <textarea
                  className={inputClass()}
                  rows={2}
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                />
              </label>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Next visit date
                <input
                  type="date"
                  className={inputClass()}
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </label>
            </div>
            <button
              type="button"
              disabled={savingTreatment}
              onClick={() => void submitTreatment()}
              className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {savingTreatment ? "Saving…" : "Save treatment note"}
            </button>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              New prescription
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Frequency and per-line notes are merged into the instruction text on each medicine.
            </p>
            <label className="mt-4 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Overall instructions (optional)
              <textarea
                className={inputClass()}
                rows={2}
                value={rxInstructions}
                onChange={(e) => setRxInstructions(e.target.value)}
              />
            </label>
            <label className="mt-3 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Valid until (optional)
              <input
                type="date"
                className={inputClass()}
                value={rxValidUntil}
                onChange={(e) => setRxValidUntil(e.target.value)}
              />
            </label>

            <div className="mt-4 space-y-4">
              {rxLines.map((line, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
                >
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Medicine {idx + 1}
                  </p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <label className="sm:col-span-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Name *
                      <input
                        className={inputClass()}
                        value={line.medicineName}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRxLines((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, medicineName: v } : r)),
                          );
                        }}
                      />
                    </label>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Dosage
                      <input
                        className={inputClass()}
                        value={line.dosage}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRxLines((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, dosage: v } : r)),
                          );
                        }}
                      />
                    </label>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Frequency
                      <input
                        className={inputClass()}
                        value={line.frequency}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRxLines((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, frequency: v } : r)),
                          );
                        }}
                      />
                    </label>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Duration
                      <input
                        className={inputClass()}
                        value={line.duration}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRxLines((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, duration: v } : r)),
                          );
                        }}
                      />
                    </label>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Instruction
                      <input
                        className={inputClass()}
                        value={line.instruction}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRxLines((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, instruction: v } : r)),
                          );
                        }}
                      />
                    </label>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Note
                      <input
                        className={inputClass()}
                        value={line.note}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRxLines((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, note: v } : r)),
                          );
                        }}
                      />
                    </label>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Quantity
                      <input
                        className={inputClass()}
                        value={line.quantity}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRxLines((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, quantity: v } : r)),
                          );
                        }}
                      />
                    </label>
                  </div>
                  {rxLines.length > 1 ? (
                    <button
                      type="button"
                      className="mt-2 text-xs text-red-700 underline dark:text-red-400"
                      onClick={() =>
                        setRxLines((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      Remove line
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-2 text-sm font-medium text-teal-800 underline dark:text-teal-400"
              onClick={() => setRxLines((prev) => [...prev, emptyRxLine()])}
            >
              + Add medicine line
            </button>
            <button
              type="button"
              disabled={savingRx}
              onClick={() => void submitPrescription()}
              className="mt-4 block rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {savingRx ? "Saving…" : "Save prescription"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
