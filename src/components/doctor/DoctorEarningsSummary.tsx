"use client";

import { useEffect, useState } from "react";

import { doctorFetch } from "@/lib/doctor/doctor-fetch";
import { readDoctorJson } from "@/lib/doctor/read-doctor-json";

export type DoctorEarningsSummaryData = {
  totalCollected: number;
  totalPlatformCommission: number;
  totalProviderPayout: number;
  paidCount: number;
  unpaidCount: number;
  currentMonthEarnings: number;
};

export function DoctorEarningsSummary() {
  const [data, setData] = useState<DoctorEarningsSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await doctorFetch("/api/doctor/earnings/summary");
        const json = await readDoctorJson<DoctorEarningsSummaryData>(res);
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load earnings");
          setData(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100">
        {error}
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading earnings summary…</p>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Earnings summary</h2>
      <p className="mt-1 text-xs text-zinc-500">
        All figures are in BDT from recorded billing. Month filter uses server calendar month.
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Total collected
          </dt>
          <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100">
            {data.totalCollected.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Platform commission
          </dt>
          <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100">
            {data.totalPlatformCommission.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Your payout (total)
          </dt>
          <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100">
            {data.totalProviderPayout.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Paid cases</dt>
          <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100">{data.paidCount}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Unpaid / partial
          </dt>
          <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100">{data.unpaidCount}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            This month (payout)
          </dt>
          <dd className="mt-0.5 font-medium text-teal-800 dark:text-teal-300">
            {data.currentMonthEarnings.toFixed(2)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
