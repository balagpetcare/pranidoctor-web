"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { FormAsyncControlSkeleton } from "@/components/admin-ui/FormAsyncControlSkeleton";
import { adminFetch } from "@/lib/admin/admin-fetch";
import type { AdminServiceRequestDto } from "@/lib/admin-service-requests/service-request-admin-service";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { useClientMountReady } from "@/lib/admin/use-client-mount-ready";
import { cn } from "@/lib/cn";
import {
  SERVICE_REQUEST_STATUS,
  type ServiceRequestStatus,
} from "@/lib/domain/service-request-constants";

type PickerDoctor = {
  id: string;
  displayName: string | null;
};

type PickerTechnician = {
  id: string;
  displayName: string | null;
};

function inputClass(): string {
  return cn(
    "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
    "outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2",
    "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  );
}

const CLOSED: ServiceRequestStatus[] = [
  SERVICE_REQUEST_STATUS.COMPLETED,
  SERVICE_REQUEST_STATUS.CANCELLED,
  SERVICE_REQUEST_STATUS.REJECTED,
];

function canAssignDoctor(status: ServiceRequestStatus): boolean {
  return (
    status === SERVICE_REQUEST_STATUS.PENDING ||
    status === SERVICE_REQUEST_STATUS.ASSIGNED
  );
}

function canAssignTechnician(status: ServiceRequestStatus): boolean {
  return !CLOSED.includes(status);
}

async function parseAssignResponse(res: Response): Promise<{
  ok: boolean;
  message: string;
}> {
  let parsed: unknown;
  try {
    parsed = await res.json();
  } catch {
    return { ok: false, message: "Invalid response from server" };
  }
  const body = parsed as
    | { ok: true; data: { request: AdminServiceRequestDto } }
    | { ok: false; error?: { message?: string } };
  if (res.ok && body.ok && "data" in body && body.data?.request) {
    return { ok: true, message: "" };
  }
  const msg =
    body.ok === false ? body.error?.message ?? "Request failed" : "Request failed";
  return { ok: false, message: msg };
}

type Props = {
  requestId: string;
  row: AdminServiceRequestDto;
  onUpdated: () => void;
};

export function ServiceRequestAssignmentActions({
  requestId,
  row,
  onUpdated,
}: Props) {
  const [doctors, setDoctors] = useState<PickerDoctor[]>([]);
  const [technicians, setTechnicians] = useState<PickerTechnician[]>([]);
  const [pickersLoading, setPickersLoading] = useState(true);
  const [pickersError, setPickersError] = useState<string | null>(null);
  const clientMountReady = useClientMountReady();
  const pickersLocked = !clientMountReady || pickersLoading;

  const [doctorId, setDoctorId] = useState(() => row.assignedDoctorId ?? "");
  const [technicianId, setTechnicianId] = useState(
    () => row.assignedTechnicianId ?? "",
  );

  const [doctorBusy, setDoctorBusy] = useState(false);
  const [techBusy, setTechBusy] = useState(false);
  const [doctorMsg, setDoctorMsg] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);
  const [techMsg, setTechMsg] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  const doctorOptions = useMemo(() => {
    const id = row.assignedDoctorId;
    const name = row.assignedDoctor?.displayName;
    if (id && !doctors.some((d) => d.id === id)) {
      return [
        { id, displayName: name ?? "বর্তমায় বরাদ্দ (তালিকায় নেই)" },
        ...doctors,
      ];
    }
    return doctors;
  }, [doctors, row.assignedDoctorId, row.assignedDoctor]);

  const technicianOptions = useMemo(() => {
    const id = row.assignedTechnicianId;
    const name = row.assignedTechnician?.displayName;
    if (id && !technicians.some((t) => t.id === id)) {
      return [
        {
          id,
          displayName: name ?? "বর্তমায় বরাদ্দ (তালিকায় নেই)",
        },
        ...technicians,
      ];
    }
    return technicians;
  }, [technicians, row.assignedTechnicianId, row.assignedTechnician]);

  const loadPickers = useCallback(async () => {
    setPickersLoading(true);
    setPickersError(null);
    try {
      const [docRes, techRes] = await Promise.all([
        adminFetch(
          "/api/admin/doctors?providerStatus=ACTIVE&userStatus=ACTIVE&limit=200&offset=0",
        ),
        adminFetch(
          "/api/admin/ai-technicians?providerStatus=ACTIVE&userStatus=ACTIVE&limit=200&offset=0",
        ),
      ]);
      const docData = await readAdminJson<{
        doctors: PickerDoctor[];
      }>(docRes);
      const techData = await readAdminJson<{
        technicians: PickerTechnician[];
      }>(techRes);
      setDoctors(docData.doctors);
      setTechnicians(techData.technicians);
    } catch (e) {
      setPickersError(
        e instanceof Error ? e.message : "Could not load provider lists",
      );
      setDoctors([]);
      setTechnicians([]);
    } finally {
      setPickersLoading(false);
    }
  }, []);

  useEffect(() => {
     
    void loadPickers();
  }, [loadPickers]);

  async function submitDoctor() {
    setDoctorMsg(null);
    if (!doctorId.trim()) {
      setDoctorMsg({ kind: "err", text: "একজন ডাক্তার বেছে নিন।" });
      return;
    }
    setDoctorBusy(true);
    try {
      const res = await adminFetch(
        `/api/admin/service-requests/${requestId}/assign-doctor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doctorProfileId: doctorId.trim() }),
        },
      );
      const out = await parseAssignResponse(res);
      if (!out.ok) {
        setDoctorMsg({ kind: "err", text: out.message });
        return;
      }
      setDoctorMsg({ kind: "ok", text: "ডাক্তার বরাদ্দ সংরক্ষিত।" });
      onUpdated();
    } catch (e) {
      setDoctorMsg({
        kind: "err",
        text: e instanceof Error ? e.message : "Assignment failed",
      });
    } finally {
      setDoctorBusy(false);
    }
  }

  async function submitTechnician() {
    setTechMsg(null);
    if (!technicianId.trim()) {
      setTechMsg({ kind: "err", text: "একজন এআই টেকনিশিয়ান বেছে নিন।" });
      return;
    }
    setTechBusy(true);
    try {
      const res = await adminFetch(
        `/api/admin/service-requests/${requestId}/assign-technician`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aiTechnicianProfileId: technicianId.trim(),
          }),
        },
      );
      const out = await parseAssignResponse(res);
      if (!out.ok) {
        setTechMsg({ kind: "err", text: out.message });
        return;
      }
      setTechMsg({ kind: "ok", text: "টেকনিশিয়ান বরাদ্দ সংরক্ষিত।" });
      onUpdated();
    } catch (e) {
      setTechMsg({
        kind: "err",
        text: e instanceof Error ? e.message : "Assignment failed",
      });
    } finally {
      setTechBusy(false);
    }
  }

  const doctorFormEnabled = canAssignDoctor(row.status as ServiceRequestStatus);
  const techFormEnabled = canAssignTechnician(row.status as ServiceRequestStatus);
  const closed = CLOSED.includes(row.status as ServiceRequestStatus);

  if (closed) {
    return (
      <AdminFormSection
        title="প্রদানকারী বরাদ্দ"
        description="এই অনুরোধ সম্পন্ন, বাতিল বা প্রত্যাখ্যাত — অ্যাডমিন থেকে বরাদ্দ বদলানো যাবে না।"
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          বর্তমান বরাদ্দ উপরের বিভাগে দেখানো হয়েছে।
        </p>
      </AdminFormSection>
    );
  }

  return (
    <AdminFormSection
      title="প্রদানকারী বরাদ্দ"
      description="উপরে বর্তমান ডাক্তার ও টেকনিশিয়ান দেখানো হয়েছে। বিস্তারিত ইতিহাস এখনো সংরক্ষণ হয় না — শুধু সর্বশেষ বরাদ্দ।"
    >
      {pickersError ? (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
          role="alert"
        >
          {pickersError}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            ডাক্তার বরাদ্দ
          </h3>
          {!doctorFormEnabled ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              ডাক্তার শুধু <strong>অপেক্ষমাণ</strong> বা <strong>বরাদ্দ</strong>{" "}
              অবস্থায় বরাদ্দ বা পরিবর্তন করা যায় (ডাক্তার গ্রহণের আগে)। গ্রহণের
              পর পুনর্বন্টন প্রয়োজন হলে অপারেশন টুল ব্যবহার করুন।
            </p>
          ) : (
            <>
              <label className="mt-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                ডাক্তার
                {pickersLocked ? (
                  <FormAsyncControlSkeleton
                    label="ডাক্তারের তালিকা লোড হচ্ছে"
                    className={inputClass()}
                  />
                ) : (
                  <select
                    className={inputClass()}
                    value={doctorId}
                    disabled={doctorBusy}
                    onChange={(e) => setDoctorId(e.target.value)}
                  >
                    <option value="">— বেছে নিন —</option>
                    {doctorOptions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {(d.displayName?.trim() || "নামহীন") +
                          ` (${d.id.slice(0, 8)}…)`}
                      </option>
                    ))}
                  </select>
                )}
              </label>
              <AdminActionButton
                type="button"
                variant="primary"
                className="mt-3"
                disabled={pickersLocked || doctorBusy || !doctorId.trim()}
                onClick={() => void submitDoctor()}
              >
                {doctorBusy ? "সংরক্ষণ…" : "ডাক্তার বরাদ্দ সংরক্ষণ"}
              </AdminActionButton>
            </>
          )}
          {doctorMsg ? (
            <p
              className={cn(
                "mt-2 text-sm",
                doctorMsg.kind === "ok"
                  ? "text-emerald-800 dark:text-emerald-300"
                  : "text-red-700 dark:text-red-300",
              )}
              role={doctorMsg.kind === "err" ? "alert" : "status"}
            >
              {doctorMsg.text}
            </p>
          ) : null}
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            এআই টেকনিশিয়ান বরাদ্দ
          </h3>
          {!techFormEnabled ? null : (
            <>
              <label className="mt-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                এআই টেকনিশিয়ান
                {pickersLocked ? (
                  <FormAsyncControlSkeleton
                    label="টেকনিশিয়ান তালিকা লোড হচ্ছে"
                    className={inputClass()}
                  />
                ) : (
                  <select
                    className={inputClass()}
                    value={technicianId}
                    disabled={techBusy}
                    onChange={(e) => setTechnicianId(e.target.value)}
                  >
                    <option value="">— বেছে নিন —</option>
                    {technicianOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {(t.displayName?.trim() || "নামহীন") +
                          ` (${t.id.slice(0, 8)}…)`}
                      </option>
                    ))}
                  </select>
                )}
              </label>
              <AdminActionButton
                type="button"
                variant="primary"
                className="mt-3"
                disabled={pickersLocked || techBusy || !technicianId.trim()}
                onClick={() => void submitTechnician()}
              >
                {techBusy ? "সংরক্ষণ…" : "টেকনিশিয়ান বরাদ্দ সংরক্ষণ"}
              </AdminActionButton>
            </>
          )}
          {techMsg ? (
            <p
              className={cn(
                "mt-2 text-sm",
                techMsg.kind === "ok"
                  ? "text-emerald-800 dark:text-emerald-300"
                  : "text-red-700 dark:text-red-300",
              )}
              role={techMsg.kind === "err" ? "alert" : "status"}
            >
              {techMsg.text}
            </p>
          ) : null}
        </div>
      </div>
    </AdminFormSection>
  );
}
