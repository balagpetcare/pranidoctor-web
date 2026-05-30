'use client';

import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AiOpsResourceBoundary } from './AiOpsResourceBoundary';
import { useAiAdminResource } from './use-ai-admin-resource';

type UsageDashboard = {
  range: { from: string; to: string };
  totals: {
    requests: number;
    totalTokens: number;
    costUsd: number;
    successRate: number;
    avgLatencyMs: number;
    fallbackCount: number;
  };
  providerComparison: Array<{ provider: string; requests: number; costUsd: number }>;
  featureComparison: Array<{ feature: string; requests: number; costUsd: number }>;
};

export function UsageAnalyticsPanel() {
  const { data, error, loading, reload } = useAiAdminResource<UsageDashboard>(
    '/api/admin/ai-ops/analytics/usage/dashboard?sinceDays=30',
  );

  const totals = data?.totals;

  return (
    <AiOpsResourceBoundary
      loading={loading && !data}
      error={error}
      reload={reload}
      loadingMessage="Loading usage analytics…"
      hasData={!!data}
    >
      <div className="space-y-6">
        <AdminPageHeader
          title="Analytics"
          description="Token consumption, cost, and feature breakdown (30-day window)"
        />

        {totals ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Kpi label="Requests" value={totals.requests.toLocaleString()} />
            <Kpi label="Total tokens" value={totals.totalTokens.toLocaleString()} />
            <Kpi label="Cost (USD)" value={totals.costUsd.toFixed(4)} />
            <Kpi label="Success rate" value={`${totals.successRate}%`} />
            <Kpi label="Avg latency" value={`${totals.avgLatencyMs} ms`} />
            <Kpi label="Fallbacks" value={totals.fallbackCount} />
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-2">
          <AnalyticsTable
            title="By provider"
            rows={data?.providerComparison ?? []}
            labelKey="provider"
          />
          <AnalyticsTable
            title="By feature"
            rows={data?.featureComparison ?? []}
            labelKey="feature"
          />
        </section>
      </div>
    </AiOpsResourceBoundary>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function AnalyticsTable({
  title,
  rows,
  labelKey,
}: {
  title: string;
  rows: Array<Record<string, string | number>>;
  labelKey: string;
}) {
  return (
    <div className="rounded-lg border bg-white">
      <h3 className="border-b px-4 py-2 text-sm font-medium">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-gray-500">
            <th className="px-4 py-2">Name</th>
            <th>Requests</th>
            <th>Cost (USD)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${String(row[labelKey])}-${i}`} className="border-b last:border-0">
              <td className="px-4 py-2 font-mono text-xs">{String(row[labelKey])}</td>
              <td>{Number(row.requests).toLocaleString()}</td>
              <td>{Number(row.costUsd).toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
