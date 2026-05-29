"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { adminFetch } from "@/lib/admin/admin-fetch";
import type {
  AdminLegalSettingsDto,
  LegalConsentAuditListDto,
} from "@/lib/admin-legal/admin-legal-settings-service";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { cn } from "@/lib/cn";

type ConsentOverviewDto = {
  requiredVersions: {
    privacyVersion: string;
    termsVersion: string;
    aiConsentVersion: string;
  };
  enforcePrivacyConsent: boolean;
  acceptanceCounts: {
    privacyAccepted: number;
    termsAccepted: number;
    aiConsentAccepted: number;
    totalCustomers: number;
  };
  recentEventsTotal: number;
};

function fieldClassName(): string {
  return cn(
    "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
    "outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2",
    "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  );
}

export function AdminLegalSettingsForm() {
  const [data, setData] = useState<AdminLegalSettingsDto | null>(null);
  const [audit, setAudit] = useState<LegalConsentAuditListDto | null>(null);
  const [overview, setOverview] = useState<ConsentOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);
  const [loadRetryKey, setLoadRetryKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, auditRes, overviewRes] = await Promise.all([
        adminFetch("/api/admin/settings/legal"),
        adminFetch("/api/admin/legal-consent?limit=20"),
        adminFetch("/api/admin/consent/overview"),
      ]);
      const settingsJson = await readAdminJson<AdminLegalSettingsDto>(settingsRes);
      const auditJson = await readAdminJson<LegalConsentAuditListDto>(auditRes);
      const overviewJson = await readAdminJson<ConsentOverviewDto>(overviewRes);
      setData(settingsJson);
      setAudit(auditJson);
      setOverview(overviewJson);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load legal settings");
      setData(null);
      setAudit(null);
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, loadRetryKey]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    setError(null);
    setSavedOk(false);
    try {
      const res = await adminFetch("/api/admin/settings/legal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          privacyPolicyUrl: data.privacyPolicyUrl,
          termsOfServiceUrl: data.termsOfServiceUrl,
          privacyVersion: data.privacyVersion,
          termsVersion: data.termsVersion,
          aiConsentVersion: data.aiConsentVersion,
          privacyTitle: data.privacyTitle,
          termsTitle: data.termsTitle,
          aiConsentTitle: data.aiConsentTitle,
          privacyContent: data.privacyContent,
          termsContent: data.termsContent,
          aiConsentContent: data.aiConsentContent,
          enforcePrivacyConsent: data.enforcePrivacyConsent,
        }),
      });
      const json = await readAdminJson<AdminLegalSettingsDto>(res);
      setData(json);
      setSavedOk(true);
      const auditRes = await adminFetch("/api/admin/legal-consent?limit=20");
      setAudit(await readAdminJson<LegalConsentAuditListDto>(auditRes));
    } catch (err) {
      setSavedOk(false);
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function patch(partial: Partial<AdminLegalSettingsDto>) {
    setData((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  if (loading) {
    return <AdminLoadingState label="Loading legal settings…" />;
  }

  if (error && !data) {
    return (
      <AdminErrorState
        message={error}
        onRetry={() => setLoadRetryKey((k) => k + 1)}
      />
    );
  }

  if (!data) return null;

  return (
    <form onSubmit={onSave} className="space-y-8">
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {savedOk ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">Saved.</p>
      ) : null}

      <AdminFormSection
        title="Versions & URLs"
        description="Bump version strings to require re-acceptance in the mobile app."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Privacy version
            <input
              className={fieldClassName()}
              value={data.privacyVersion}
              onChange={(e) => patch({ privacyVersion: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Terms version
            <input
              className={fieldClassName()}
              value={data.termsVersion}
              onChange={(e) => patch({ termsVersion: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            AI consent version
            <input
              className={fieldClassName()}
              value={data.aiConsentVersion}
              onChange={(e) => patch({ aiConsentVersion: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={data.enforcePrivacyConsent}
              onChange={(e) => patch({ enforcePrivacyConsent: e.target.checked })}
            />
            Enforce privacy acceptance on protected mobile APIs
          </label>
          <label className="block text-sm sm:col-span-2">
            Privacy policy URL
            <input
              className={fieldClassName()}
              value={data.privacyPolicyUrl}
              onChange={(e) => patch({ privacyPolicyUrl: e.target.value })}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            Terms URL
            <input
              className={fieldClassName()}
              value={data.termsOfServiceUrl}
              onChange={(e) => patch({ termsOfServiceUrl: e.target.value })}
            />
          </label>
        </div>
      </AdminFormSection>

      <AdminFormSection
        title="In-app summaries"
        description="Shown in the mobile app before users open the full public policy."
      >
        <label className="block text-sm">
          Privacy summary
          <textarea
            className={cn(fieldClassName(), "min-h-[120px]")}
            value={data.privacyContent}
            onChange={(e) => patch({ privacyContent: e.target.value })}
          />
        </label>
        <label className="mt-4 block text-sm">
          AI consent summary
          <textarea
            className={cn(fieldClassName(), "min-h-[100px]")}
            value={data.aiConsentContent}
            onChange={(e) => patch({ aiConsentContent: e.target.value })}
          />
        </label>
      </AdminFormSection>

      <div className="flex flex-wrap gap-2">
        <AdminActionButton type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving…" : "Save legal settings"}
        </AdminActionButton>
        {data.updatedAt ? (
          <span className="self-center text-xs text-muted-foreground">
            Last updated {new Date(data.updatedAt).toLocaleString()}
          </span>
        ) : null}
      </div>

      {overview ? (
        <AdminFormSection
          title="Acceptance overview"
          description="Active customers on current published consent versions."
        >
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Privacy (current)</dt>
              <dd className="font-medium">
                {overview.acceptanceCounts.privacyAccepted} /{" "}
                {overview.acceptanceCounts.totalCustomers}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Terms (current)</dt>
              <dd className="font-medium">
                {overview.acceptanceCounts.termsAccepted} /{" "}
                {overview.acceptanceCounts.totalCustomers}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">AI consent (current)</dt>
              <dd className="font-medium">
                {overview.acceptanceCounts.aiConsentAccepted} /{" "}
                {overview.acceptanceCounts.totalCustomers}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Total audit events</dt>
              <dd className="font-medium">{overview.recentEventsTotal}</dd>
            </div>
          </dl>
        </AdminFormSection>
      ) : null}

      <AdminFormSection title="Recent consent events" description="Append-only audit log.">
        {audit && audit.items.length > 0 ? (
          <div className="overflow-x-auto text-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-2">Time</th>
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2 pr-2">Version</th>
                  <th className="py-2 pr-2">User</th>
                </tr>
              </thead>
              <tbody>
                {audit.items.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 pr-2 whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-2">{row.consentType}</td>
                    <td className="py-2 pr-2">{row.version}</td>
                    <td className="py-2 pr-2 font-mono text-xs">{row.userId.slice(0, 12)}…</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No consent events recorded yet.</p>
        )}
      </AdminFormSection>
    </form>
  );
}
