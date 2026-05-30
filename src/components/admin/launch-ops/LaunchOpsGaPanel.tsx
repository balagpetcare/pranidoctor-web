'use client';

import { useCallback, useEffect, useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminStatCard } from '@/components/admin-ui/AdminStatCard';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';

type GaDashboard = {
  generatedAt: string;
  config: {
    enabled: boolean;
    phase: string;
    goNoGoVerdict: string;
    playRolloutPct: number;
    weeklyRegistrationCap: number | null;
    minDoctorsForPhase: number;
  };
  users: {
    totalCustomers: number;
    registeredLast7Days: number;
    activatedLast7Days: number;
    weeklyCapRemaining: number | null;
  };
  doctors: {
    activeVerified: number;
    acceptingEmergency: number;
    minRequired: number;
    supplyOk: boolean;
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
    gaFeedbackTicketsLast7Days: number;
  };
  systemHealth: {
    ready: boolean;
    aiGovernanceHydrated: boolean;
    llmDisabled: boolean;
  };
};

type GaReadiness = {
  generatedAt: string;
  verdict: string;
  scores: {
    technical: number;
    operational: number;
    compliance: number;
    security: number;
    business: number;
    overall: number;
  };
  checklistSummary: {
    total: number;
    pass: number;
    fail: number;
    open: number;
    waived: number;
    p0Open: number;
  };
  rolloutRecommendation: string;
};

export function LaunchOpsGaPanel() {
  const [ga, setGa] = useState<GaDashboard | null>(null);
  const [readiness, setReadiness] = useState<GaReadiness | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [dashRes, readyRes] = await Promise.all([
        adminFetch('/api/admin/launch/ga-dashboard'),
        adminFetch('/api/admin/launch/ga-readiness'),
      ]);
      setGa(await readAdminJson<GaDashboard>(dashRes));
      setReadiness(await readAdminJson<GaReadiness>(readyRes));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load GA dashboard');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!ga || !readiness) {
    return <p className="text-sm text-muted-foreground">Loading GA metrics…</p>;
  }

  const verdictColor =
    readiness.verdict === 'GO'
      ? 'text-green-600'
      : readiness.verdict === 'GO_WITH_CONDITIONS'
        ? 'text-amber-600'
        : 'text-red-600';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">
          Generated {new Date(ga.generatedAt).toLocaleString()} · Phase{' '}
          <strong>{ga.config.phase}</strong> · GA {ga.config.enabled ? 'enabled' : 'disabled'} ·
          Play rollout {ga.config.playRolloutPct}%
        </p>
        <AdminActionButton onClick={() => void load()} variant="secondary">
          Refresh GA
        </AdminActionButton>
      </div>

      <p className={`text-sm font-medium ${verdictColor}`}>
        Go/No-Go: {readiness.verdict} · Overall readiness {readiness.scores.overall}%
        {readiness.checklistSummary.p0Open > 0
          ? ` · ${readiness.checklistSummary.p0Open} P0 checklist open`
          : ''}
      </p>
      <p className="text-muted-foreground text-xs">{readiness.rolloutRecommendation}</p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard title="Technical" value={`${readiness.scores.technical}%`} />
        <AdminStatCard title="Operational" value={`${readiness.scores.operational}%`} />
        <AdminStatCard title="Compliance" value={`${readiness.scores.compliance}%`} />
        <AdminStatCard title="Security" value={`${readiness.scores.security}%`} />
        <AdminStatCard title="Business" value={`${readiness.scores.business}%`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Total customers" value={String(ga.users.totalCustomers)} />
        <AdminStatCard
          title="Registrations (7d)"
          value={String(ga.users.registeredLast7Days)}
          description={
            ga.users.weeklyCapRemaining !== null
              ? `${ga.users.weeklyCapRemaining} weekly cap left`
              : undefined
          }
        />
        <AdminStatCard
          title="Active doctors"
          value={String(ga.doctors.activeVerified)}
          description={
            ga.doctors.supplyOk
              ? `≥ ${ga.doctors.minRequired} required`
              : `Need ${ga.doctors.minRequired} (shortfall)`
          }
        />
        <AdminStatCard
          title="Completion rate"
          value={
            ga.consultations.completionRatePct !== null
              ? `${ga.consultations.completionRatePct}%`
              : '—'
          }
        />
        <AdminStatCard title="Emergency SRs" value={String(ga.consultations.emergencyRequests)} />
        <AdminStatCard
          title="AI sessions (7d)"
          value={String(ga.ai.sessionsLast7Days)}
          description={ga.ai.llmDisabled ? 'LLM disabled' : 'LLM active'}
        />
        <AdminStatCard title="Open escalations" value={String(ga.ai.escalationsOpen)} />
        <AdminStatCard title="Open tickets" value={String(ga.support.openTickets)} />
      </div>

      <p className="text-muted-foreground text-xs">
        Checklist: {readiness.checklistSummary.pass} pass · {readiness.checklistSummary.open} open ·{' '}
        {readiness.checklistSummary.fail} fail · {readiness.checklistSummary.waived} waived — see{' '}
        <code>docs/launch/ga-checklist.md</code>
      </p>
    </div>
  );
}
