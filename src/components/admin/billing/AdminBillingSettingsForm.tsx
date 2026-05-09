"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { adminFetch } from "@/lib/admin/admin-fetch";
import type { AdminBillingSettingsDto } from "@/lib/admin-billing/admin-billing-settings-service";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { cn } from "@/lib/cn";

function inputClassName(): string {
  return cn(
    "mt-1 block w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
    "outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2",
    "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  );
}

export function AdminBillingSettingsForm() {
  const [data, setData] = useState<AdminBillingSettingsDto | null>(null);
  const [percentInput, setPercentInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);
  const [loadRetryKey, setLoadRetryKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/settings/billing");
      const json = await readAdminJson<AdminBillingSettingsDto>(res);
      setData(json);
      setPercentInput(String(json.commissionPercent));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load settings");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void load();
  }, [load, loadRetryKey]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedOk(false);
    try {
      const pct = Number(percentInput);
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        setError("Commission must be between 0 and 100 percent.");
        return;
      }
      const res = await adminFetch("/api/admin/settings/billing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionPercent: pct }),
      });
      const json = await readAdminJson<AdminBillingSettingsDto>(res);
      setData(json);
      setPercentInput(String(json.commissionPercent));
      setSavedOk(true);
    } catch (err) {
      setSavedOk(false);
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <AdminLoadingState message="বিলিং সেটিংস লোড হচ্ছে…" />;
  }

  if (error && !data) {
    return (
      <div className="space-y-4" lang="bn">
        <AdminErrorState
          message={error}
          onRetry={() => setLoadRetryKey((k) => k + 1)}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void onSave(e)}
      className="max-w-2xl space-y-6"
      lang="bn"
    >
      {error && data ? (
        <AdminErrorState title="সংরক্ষণ বা যাচাই ত্রুটি" message={error} />
      ) : null}
      {savedOk ? (
        <div
          className="rounded-[var(--pd-admin-radius,0.75rem)] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100"
          role="status"
        >
          সংরক্ষিত হয়েছে।
        </div>
      ) : null}

      <AdminFormSection
        title="কমিশন নীতি"
        description={
          data?.explanation ??
          "কমিশন প্রধানত সার্ভিস ফির উপর প্রযোজ্য (সার্ভিস অংশে ডিসকাউন্টের পর)। ওষুধ ও যাতায়াত খরচ সাধারণত কমিশন ভিত্তিতে পড়ে না।"
        }
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          নিচের হার <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">PLATFORM_COMMISSION_RATE</code>{" "}
          হিসেবে সংরক্ষিত।
        </p>
      </AdminFormSection>

      <AdminFormSection title="প্ল্যাটফর্ম কমিশন হার" description="০–১০০ শতাংশ।">
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
          কমিশন (%)
        </label>
        <input
          type="number"
          min={0}
          max={100}
          step="0.01"
          required
          value={percentInput}
          onChange={(e) => setPercentInput(e.target.value)}
          className={inputClassName()}
        />
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          কার্যকর হার:{" "}
          <span className="font-mono">
            {data ? (data.commissionRate * 100).toFixed(2) : "—"}%
          </span>{" "}
          (দশমিক {data?.commissionRate.toFixed(4)})
        </p>
      </AdminFormSection>

      <AdminActionButton type="submit" variant="primary" disabled={saving}>
        {saving ? "সংরক্ষণ…" : "সংরক্ষণ"}
      </AdminActionButton>
    </form>
  );
}
