"use client";

import { useCallback, useEffect, useState } from "react";

type Entry = {
  id: string;
  createdAtIso: string;
  phoneNormalized: string;
  phoneMasked: string;
  otpPlain: string | null;
  expiresAtIso: string;
  status: string;
};

type ApiOk = {
  ok: true;
  data: { otpMode: string; entries: Entry[] };
};

export function AdminOtpDevLogsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otpMode, setOtpMode] = useState<string>("");
  const [entries, setEntries] = useState<Entry[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dev-tools/otp-logs", {
        credentials: "include",
      });
      const json: unknown = await res.json();
      if (!res.ok || !json || typeof json !== "object" || !("ok" in json)) {
        setError("ডেটা লোড করা যায়নি।");
        return;
      }
      const body = json as ApiOk | { ok: false };
      if (!body.ok) {
        setError("অনুমতি নেই বা সেশন মেয়াদ শেষ।");
        return;
      }
      setOtpMode(body.data.otpMode);
      setEntries(body.data.entries);
    } catch {
      setError("নেটওয়ার্ক ত্রুটি।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-lg border border-[var(--pd-admin-border)] bg-[var(--pd-admin-surface)] px-4 py-2 text-sm font-medium hover:opacity-90"
          onClick={() => void load()}
        >
          রিফ্রেশ
        </button>
        {otpMode ? (
          <span className="text-sm text-[var(--pd-admin-muted)]">
            OTP_MODE: <strong>{otpMode}</strong>
          </span>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--pd-admin-muted)]">লোড হচ্ছে…</p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {!loading && !error ? (
        <div className="overflow-x-auto rounded-lg border border-[var(--pd-admin-border)]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[var(--pd-admin-surface)]">
              <tr>
                <th className="px-3 py-2 font-medium">সময়</th>
                <th className="px-3 py-2 font-medium">নম্বর</th>
                <th className="px-3 py-2 font-medium">OTP (ডেভ)</th>
                <th className="px-3 py-2 font-medium">মেয়াদ</th>
                <th className="px-3 py-2 font-medium">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-[var(--pd-admin-muted)]"
                  >
                    কোনো ডেভ OTP লগ নেই। মোবাইল অ্যাপ থেকে কোড পাঠান।
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr
                    key={e.id}
                    className="border-t border-[var(--pd-admin-border)]"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(e.createdAtIso).toLocaleString("bn-BD")}
                    </td>
                    <td className="px-3 py-2 font-mono">{e.phoneMasked}</td>
                    <td className="px-3 py-2 font-mono">
                      {e.otpPlain ?? "— (লুকানো / লাইভ)"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(e.expiresAtIso).toLocaleString("bn-BD")}
                    </td>
                    <td className="px-3 py-2">{e.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
