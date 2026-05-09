"use client";

import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { doctorFetch } from "@/lib/doctor/doctor-fetch";
import { readDoctorJson } from "@/lib/doctor/read-doctor-json";
import type { ServiceRequestDto } from "@/lib/mobile-service-requests/service-request-mapper";
import { cn } from "@/lib/cn";
import type { DoctorListTab } from "@/lib/doctor-service-requests/schemas";

function fmtEnum(s: string): string {
  return s.replace(/_/g, " ");
}

function shortId(id: string): string {
  if (id.length <= 10) return id;
  return `${id.slice(0, 8)}…`;
}

function animalLabel(r: ServiceRequestDto): string {
  const a = r.animal;
  if (!a) return "—";
  const type = a.animalType ? fmtEnum(a.animalType) : null;
  return [a.name, a.species, type].filter(Boolean).join(" · ");
}

type ListPayload = {
  requests: ServiceRequestDto[];
  total: number;
  limit: number;
  offset: number;
  tab: DoctorListTab;
};

const TAB_DESCRIPTION: Record<DoctorListTab, { bn: string; en: string }> = {
  new: {
    bn: "আপনাকে নির্ধারণ করা হয়েছে — গ্রহণ বা পরবর্তী পদক্ষেপের জন্য অপেক্ষমান।",
    en: "Assigned to you — awaiting acceptance or next step.",
  },
  active: {
    bn: "চলমান চিকিৎসা বা পরিদর্শন।",
    en: "Cases in progress.",
  },
  completed: {
    bn: "সম্পন্ন করা সেবা অনুরোধ।",
    en: "Completed service requests.",
  },
};

export function DoctorServiceRequestsList({ tab }: { tab: DoctorListTab }) {
  const [rows, setRows] = useState<ServiceRequestDto[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        tab,
        limit: String(limit),
        offset: String(offset),
      });
      const data = await readDoctorJson<ListPayload>(
        await doctorFetch(`/api/doctor/service-requests?${qs.toString()}`),
      );
      setRows(data.requests);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load requests");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tab, limit, offset]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void load();
  }, [load]);

  const desc = TAB_DESCRIPTION[tab];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-teal-800 dark:text-teal-400">
          {desc.en}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400" lang="bn">
          {desc.bn}
        </p>
      </header>

      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No requests in this list.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-950/80">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Request
                </th>
                <th className="hidden px-4 py-3 font-medium text-zinc-700 sm:table-cell dark:text-zinc-300">
                  Animal
                </th>
                <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                  Status
                </th>
                <th className="hidden px-4 py-3 font-medium text-zinc-700 md:table-cell dark:text-zinc-300">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/doctor/requests/${r.id}`}
                      className="font-mono text-xs font-medium text-teal-800 underline-offset-2 hover:underline dark:text-teal-400"
                    >
                      {shortId(r.id)}
                    </Link>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                      {r.serviceCategory?.name ?? r.serviceCategoryId}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-800 dark:text-zinc-200 sm:table-cell">
                    {animalLabel(r)}
                  </td>
                  <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200">
                    {fmtEnum(r.status)}
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-600 dark:text-zinc-400 md:table-cell">
                    {(() => {
                      try {
                        return format(parseISO(r.submittedAt), "yyyy-MM-dd HH:mm");
                      } catch {
                        return r.submittedAt;
                      }
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && total > limit ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            Showing {offset + 1}–{Math.min(offset + rows.length, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={offset === 0}
              onClick={() => setOffset((o) => Math.max(0, o - limit))}
              className={cn(
                "rounded-lg border border-zinc-300 px-3 py-1.5 font-medium dark:border-zinc-600",
                "disabled:cursor-not-allowed disabled:opacity-40",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800",
              )}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={offset + rows.length >= total}
              onClick={() => setOffset((o) => o + limit)}
              className={cn(
                "rounded-lg border border-zinc-300 px-3 py-1.5 font-medium dark:border-zinc-600",
                "disabled:cursor-not-allowed disabled:opacity-40",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800",
              )}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
