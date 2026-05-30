"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";

type ConsentOverviewDto = {
  requiredVersions: {
    privacyVersion: string;
    termsVersion: string;
    aiConsentVersion: string;
    vetDisclaimerVersion?: string;
    emergencyLimitationVersion?: string;
  };
  policyUrls?: {
    privacyPolicyUrl: string;
    termsOfServiceUrl: string;
  };
  legalGateEnabled?: boolean;
  enforcePrivacyConsent: boolean;
  acceptanceCounts: {
    privacyAccepted: number;
    termsAccepted: number;
    aiConsentAccepted: number;
    vetDisclaimerAccepted?: number;
    emergencyLimitationAccepted?: number;
    totalCustomers: number;
  };
  recentEventsTotal: number;
};

function pct(accepted: number, total: number): string {
  if (total <= 0) return "—";
  return `${Math.round((accepted / total) * 100)}%`;
}

export function LaunchOpsCompliancePanel() {
  const [overview, setOverview] = useState<ConsentOverviewDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminFetch("/api/admin/consent/overview");
        const json = await readAdminJson<ConsentOverviewDto>(res);
        if (!cancelled) {
          setOverview(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load compliance overview");
          setOverview(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading compliance status…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!overview) return null;

  const total = overview.acceptanceCounts.totalCustomers;
  const rows = [
    {
      label: "Privacy",
      version: overview.requiredVersions.privacyVersion,
      accepted: overview.acceptanceCounts.privacyAccepted,
    },
    {
      label: "Terms",
      version: overview.requiredVersions.termsVersion,
      accepted: overview.acceptanceCounts.termsAccepted,
    },
    {
      label: "AI consent",
      version: overview.requiredVersions.aiConsentVersion,
      accepted: overview.acceptanceCounts.aiConsentAccepted,
    },
    {
      label: "Vet disclaimer",
      version: overview.requiredVersions.vetDisclaimerVersion ?? "—",
      accepted: overview.acceptanceCounts.vetDisclaimerAccepted ?? 0,
    },
    {
      label: "Emergency limitation",
      version: overview.requiredVersions.emergencyLimitationVersion ?? "—",
      accepted: overview.acceptanceCounts.emergencyLimitationAccepted ?? 0,
    },
  ];

  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-3 text-xs">
        <span>
          Privacy enforce:{" "}
          <strong>{overview.enforcePrivacyConsent ? "ON" : "OFF"}</strong>
        </span>
        {overview.legalGateEnabled != null && (
          <span>
            Client legal gate:{" "}
            <strong>{overview.legalGateEnabled ? "ON" : "OFF"}</strong>
          </span>
        )}
        <span>
          Consent events (total): <strong>{overview.recentEventsTotal}</strong>
        </span>
      </div>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="py-1 pr-2">Type</th>
            <th className="py-1 pr-2">Version</th>
            <th className="py-1 pr-2">Accepted</th>
            <th className="py-1">%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-1.5 pr-2">{r.label}</td>
              <td className="py-1.5 pr-2 font-mono text-xs">{r.version}</td>
              <td className="py-1.5 pr-2">
                {r.accepted} / {total}
              </td>
              <td className="py-1.5">{pct(r.accepted, total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
        <li>
          <Link className="text-primary underline" href="/admin/settings/legal">
            Policy versions &amp; URLs
          </Link>
        </li>
        <li>
          <Link className="text-primary underline" href="/api/admin/legal-consent">
            Consent audit log (API)
          </Link>
        </li>
        {overview.policyUrls && (
          <li>
            Published:{" "}
            <a
              className="text-primary underline"
              href={overview.policyUrls.privacyPolicyUrl}
              target="_blank"
              rel="noreferrer"
            >
              Privacy
            </a>
            {" · "}
            <a
              className="text-primary underline"
              href={overview.policyUrls.termsOfServiceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Terms
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
