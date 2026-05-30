'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminStatCard } from '@/components/admin-ui/AdminStatCard';
import { LaunchOpsCompliancePanel } from '@/components/admin/launch-ops/LaunchOpsCompliancePanel';
import { LaunchOpsGaPanel } from '@/components/admin/launch-ops/LaunchOpsGaPanel';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';
import { useAdminPanelLoad } from '@/lib/admin/use-admin-panel-load';

type ProbeResult = {
  label: string;
  url: string;
  status: number | null;
  ok: boolean;
};

type BetaDashboard = {
  generatedAt: string;
  config: {
    enabled: boolean;
    activeCohort: string;
    maxUsers: number;
    maxDoctors: number;
    enforceInviteList: boolean;
    feedbackEnabled: boolean;
  };
  users: {
    totalBetaTagged: number;
    registeredLast7Days: number;
    activatedLast7Days: number;
    capRemaining: number | null;
  };
  doctors: {
    totalBetaTagged: number;
    activeVerified: number;
    acceptingEmergency: number;
    capRemaining: number | null;
  };
  consultations: {
    totalRequests: number;
    pending: number;
    completed: number;
    emergencyRequests: number;
    completionRatePct: number | null;
  };
  ai: {
    sessionsLast7Days: number;
    escalationsOpen: number;
    llmDisabled: boolean;
  };
  support: {
    openTickets: number;
    betaFeedbackTicketsLast7Days: number;
  };
  systemHealth: {
    ready: boolean;
    aiGovernanceHydrated: boolean;
    llmDisabled: boolean;
  };
};

async function probe(url: string): Promise<ProbeResult> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    return { label: url, url, status: res.status, ok: res.ok };
  } catch {
    return { label: url, url, status: null, ok: false };
  }
}

export default function LaunchOpsPage() {
  const [results, setResults] = useState<ProbeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [beta, setBeta] = useState<BetaDashboard | null>(null);
  const [betaError, setBetaError] = useState<string | null>(null);

  const loadBetaDashboard = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/launch/beta-dashboard');
      const data = await readAdminJson<BetaDashboard>(res);
      setBeta(data);
      setBetaError(null);
    } catch (e) {
      setBetaError(e instanceof Error ? e.message : 'Failed to load beta dashboard');
    }
  }, []);

  useAdminPanelLoad(loadBetaDashboard);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const targets = [
        '/api/health',
        '/api/health/live',
        '/api/health/ready',
        '/api/admin/health/ready',
        '/api/admin/uptime',
      ];
      const out = await Promise.all(targets.map((t) => probe(t)));
      if (!cancelled) {
        setResults(out);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Launch Operations</h1>
          <p className="text-muted-foreground text-sm">
            Closed beta + GA dashboards, health probes, legal links, and runbook shortcuts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminActionButton href="/admin/ai-ops/settings" variant="secondary">
            AI governance
          </AdminActionButton>
          <AdminActionButton href="/admin/analytics/overview" variant="secondary">
            Analytics
          </AdminActionButton>
          <AdminActionButton onClick={() => void loadBetaDashboard()} variant="secondary">
            Refresh beta metrics
          </AdminActionButton>
        </div>
      </div>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium mb-3">Closed beta dashboard</h2>
        {betaError ? (
          <p className="text-sm text-red-600">{betaError}</p>
        ) : beta ? (
          <>
            <p className="text-muted-foreground text-xs mb-4">
              Generated {new Date(beta.generatedAt).toLocaleString()} · Cohort{' '}
              <strong>{beta.config.activeCohort}</strong> · Beta{' '}
              {beta.config.enabled ? 'enabled' : 'disabled'}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AdminStatCard
                title="Beta users tagged"
                value={String(beta.users.totalBetaTagged)}
                description={
                  beta.users.capRemaining !== null
                    ? `${beta.users.capRemaining} cap remaining`
                    : undefined
                }
              />
              <AdminStatCard
                title="Registrations (7d)"
                value={String(beta.users.registeredLast7Days)}
              />
              <AdminStatCard
                title="Activations (7d)"
                value={String(beta.users.activatedLast7Days)}
              />
              <AdminStatCard
                title="Beta doctors tagged"
                value={String(beta.doctors.totalBetaTagged)}
                description={`${beta.doctors.acceptingEmergency} emergency`}
              />
              <AdminStatCard
                title="Consultations"
                value={String(beta.consultations.totalRequests)}
                description={`${beta.consultations.pending} pending`}
              />
              <AdminStatCard
                title="Completion rate"
                value={
                  beta.consultations.completionRatePct !== null
                    ? `${beta.consultations.completionRatePct}%`
                    : '—'
                }
              />
              <AdminStatCard
                title="Emergency SRs"
                value={String(beta.consultations.emergencyRequests)}
              />
              <AdminStatCard
                title="AI sessions (7d)"
                value={String(beta.ai.sessionsLast7Days)}
                description={beta.ai.llmDisabled ? 'LLM disabled' : 'LLM active'}
              />
              <AdminStatCard
                title="Open escalations"
                value={String(beta.ai.escalationsOpen)}
              />
              <AdminStatCard
                title="Open support tickets"
                value={String(beta.support.openTickets)}
              />
              <AdminStatCard
                title="Beta feedback (7d)"
                value={String(beta.support.betaFeedbackTicketsLast7Days)}
              />
              <AdminStatCard
                title="Governance hydrated"
                value={beta.systemHealth.aiGovernanceHydrated ? 'Yes' : 'No'}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Loading beta metrics…</p>
        )}
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium mb-3">General availability (GA)</h2>
        <LaunchOpsGaPanel />
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium mb-3">Health probes</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Running probes…</p>
        ) : (
          <ul className="space-y-2 text-sm font-mono">
            {results.map((r) => (
              <li key={r.url} className="flex flex-wrap gap-2 items-center">
                <span className={r.ok ? 'text-green-600' : 'text-red-600'}>
                  {r.status ?? 'ERR'}
                </span>
                <span>{r.url}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium mb-3">Legal compliance</h2>
        <LaunchOpsCompliancePanel />
        <p className="text-muted-foreground text-xs mt-3">
          Configure versions in{' '}
          <Link className="text-primary underline" href="/admin/settings/legal">
            Admin → Legal settings
          </Link>
          . Checklist: <code>pranidoctor_user/docs/compliance/legal-readiness-checklist.md</code>
        </p>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium mb-3">Public legal pages</h2>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>
            <Link className="text-primary underline" href="/privacy">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link className="text-primary underline" href="/terms">
              Terms of Service
            </Link>
          </li>
          <li>
            <Link className="text-primary underline" href="/refund">
              Refund Policy
            </Link>
          </li>
          <li>
            <Link className="text-primary underline" href="/legal/disclaimer">
              Veterinary Disclaimer
            </Link>
          </li>
        </ul>
      </section>

      <section className="rounded-lg border p-4 text-sm">
        <h2 className="font-medium mb-3">Launch docs (repository)</h2>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>
            <code>docs/launch/general-availability-launch-plan.md</code>
          </li>
          <li>
            <code>docs/launch/ga-checklist.md</code>
          </li>
          <li>
            <code>docs/launch/ga-runbook.md</code>
          </li>
          <li>
            <code>docs/launch/ga-support-playbook.md</code>
          </li>
          <li>
            <code>docs/launch/ga-war-room-procedures.md</code>
          </li>
          <li>
            <code>docs/launch/ga-success-metrics.md</code>
          </li>
          <li>
            <code>docs/launch/closed-beta-launch-plan.md</code>
          </li>
          <li>
            <code>docs/launch/closed-beta-checklist.md</code>
          </li>
          <li>
            <code>docs/launch/beta-operations-runbook.md</code>
          </li>
          <li>
            <code>docs/launch/beta-support-playbook.md</code>
          </li>
          <li>
            <code>docs/launch/beta-success-metrics.md</code>
          </li>
        </ul>
      </section>
    </div>
  );
}
