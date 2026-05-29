'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';

type Overview = {
  since: string;
  sessions: { chat: number; triage: number; symptomChecks: number };
  escalations: number;
  recommendations: number;
  avgHerdHealth: number | null;
};

export function AiOpsOverview() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch('/api/admin/ai-ops/overview')
      .then((res) => readAdminJson<Overview>(res))
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <AdminLoadingState label="Loading AI dashboard…" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="AI Operations" subtitle="Phase 8 ecosystem metrics" />
      <div className="grid gap-4 md:grid-cols-3">
        <Kpi label="Chat sessions" value={data.sessions.chat} />
        <Kpi label="Symptom checks" value={data.sessions.symptomChecks} />
        <Kpi label="Escalations" value={data.escalations} />
        <Kpi label="Smart recommendations" value={data.recommendations} />
        <Kpi label="Avg herd health" value={data.avgHerdHealth ?? '—'} />
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
