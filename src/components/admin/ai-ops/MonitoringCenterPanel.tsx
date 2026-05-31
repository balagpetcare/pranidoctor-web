'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AiOpsResourceBoundary } from './AiOpsResourceBoundary';
import { useAiAdminResource } from './use-ai-admin-resource';

type UsageDashboard = {
  totals: {
    requests: number;
    totalTokens: number;
    costUsd: number;
    successRate: number;
    avgLatencyMs: number;
    fallbackCount: number;
  };
  providerComparison: Array<{ provider: string; requests: number; costUsd: number; totalTokens?: number }>;
  featureComparison: Array<{ feature: string; requests: number; costUsd: number }>;
};

type TrendPoint = { date: string; costUsd: number; requests?: number; totalTokens?: number };
type CostRow = { date?: string; month?: string; costUsd: number; totalTokens?: number; requests?: number };
type UsageEntity = { userId?: string; customerId?: string; totalTokens: number; costUsd: number; requests: number };

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'trends', label: 'Trends' },
  { id: 'daily', label: 'Daily cost' },
  { id: 'monthly', label: 'Monthly cost' },
  { id: 'providers', label: 'Providers' },
  { id: 'features', label: 'Features' },
  { id: 'users', label: 'User lookup' },
  { id: 'customers', label: 'Customer lookup' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function MonitoringCenterPanel() {
  const [tab, setTab] = useState<TabId>('overview');
  const [lookupId, setLookupId] = useState('');

  const dashboard = useAiAdminResource<UsageDashboard>(
    '/api/admin/ai-ops/analytics/usage/dashboard?sinceDays=30',
  );
  const trends = useAiAdminResource<{ trends: TrendPoint[] }>(
    tab === 'trends' ? '/api/admin/ai-ops/analytics/usage/trends?sinceDays=30' : null,
  );
  const daily = useAiAdminResource<{ dailyCost: CostRow[] }>(
    tab === 'daily' ? '/api/admin/ai-ops/analytics/usage/daily-cost?sinceDays=30' : null,
  );
  const monthly = useAiAdminResource<{ monthlyCost: CostRow[] }>(
    tab === 'monthly' ? '/api/admin/ai-ops/analytics/usage/monthly-cost?sinceDays=90' : null,
  );
  const providers = useAiAdminResource<{ providers: UsageDashboard['providerComparison'] }>(
    tab === 'providers' ? '/api/admin/ai-ops/analytics/usage/providers?sinceDays=30' : null,
  );
  const features = useAiAdminResource<{ features: UsageDashboard['featureComparison'] }>(
    tab === 'features' ? '/api/admin/ai-ops/analytics/usage/features?sinceDays=30' : null,
  );
  const userUsage = useAiAdminResource<UsageEntity>(
    tab === 'users' && lookupId
      ? `/api/admin/ai-ops/usage/users/${encodeURIComponent(lookupId)}?sinceDays=30`
      : null,
  );
  const customerUsage = useAiAdminResource<UsageEntity>(
    tab === 'customers' && lookupId
      ? `/api/admin/ai-ops/usage/customers/${encodeURIComponent(lookupId)}?sinceDays=30`
      : null,
  );

  const totals = dashboard.data?.totals;

  return (
    <AiOpsResourceBoundary
      loading={dashboard.loading && !dashboard.data}
      error={dashboard.error}
      reload={dashboard.reload}
      loadingMessage="Loading monitoring data…"
      hasData={!!dashboard.data}
    >
      <div className="space-y-6">
        <AdminPageHeader
          title="Monitoring Center"
          description="Token tracking, cost analytics, provider/feature usage, and drill-down reports"
        />

        <div className="flex flex-wrap gap-2 border-b pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`rounded px-3 py-1 text-sm ${
                tab === t.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && totals ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Kpi label="Requests" value={totals.requests.toLocaleString()} />
              <Kpi label="Total tokens" value={totals.totalTokens.toLocaleString()} />
              <Kpi label="Cost (USD)" value={totals.costUsd.toFixed(4)} />
              <Kpi label="Success rate" value={`${totals.successRate}%`} />
              <Kpi label="Avg latency" value={`${totals.avgLatencyMs} ms`} />
              <Kpi label="Fallbacks" value={totals.fallbackCount} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <SimpleTable title="By provider" rows={dashboard.data?.providerComparison ?? []} labelKey="provider" />
              <SimpleTable title="By feature" rows={dashboard.data?.featureComparison ?? []} labelKey="feature" />
            </div>
          </>
        ) : null}

        {tab === 'trends' ? (
          <SeriesTable title="Cost trends (daily)" rows={trends.data?.trends ?? []} loading={trends.loading} />
        ) : null}
        {tab === 'daily' ? (
          <SeriesTable title="Daily cost" rows={daily.data?.dailyCost ?? []} loading={daily.loading} />
        ) : null}
        {tab === 'monthly' ? (
          <SeriesTable title="Monthly cost" rows={monthly.data?.monthlyCost ?? []} loading={monthly.loading} />
        ) : null}
        {tab === 'providers' ? (
          <SimpleTable
            title="Provider usage"
            rows={providers.data?.providers ?? []}
            labelKey="provider"
            loading={providers.loading}
          />
        ) : null}
        {tab === 'features' ? (
          <SimpleTable
            title="Feature usage"
            rows={features.data?.features ?? []}
            labelKey="feature"
            loading={features.loading}
          />
        ) : null}

        {(tab === 'users' || tab === 'customers') && (
          <div className="space-y-3">
            <input
              className="w-full max-w-md rounded border px-3 py-2 text-sm"
              placeholder={tab === 'users' ? 'User ID' : 'Customer ID'}
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
            />
            {tab === 'users' && userUsage.data ? (
              <UsageSummary entity={userUsage.data} />
            ) : null}
            {tab === 'customers' && customerUsage.data ? (
              <UsageSummary entity={customerUsage.data} />
            ) : null}
          </div>
        )}
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

function SimpleTable({
  title,
  rows,
  labelKey,
  loading,
}: {
  title: string;
  rows: Array<Record<string, string | number>>;
  labelKey: string;
  loading?: boolean;
}) {
  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
  return (
    <div className="rounded-lg border bg-white">
      <h3 className="border-b px-4 py-2 text-sm font-medium">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-gray-500">
            <th className="px-4 py-2">Name</th>
            <th>Requests</th>
            <th>Tokens</th>
            <th>Cost (USD)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${String(row[labelKey])}-${i}`} className="border-b last:border-0">
              <td className="px-4 py-2 font-mono text-xs">{String(row[labelKey])}</td>
              <td>{Number(row.requests ?? 0).toLocaleString()}</td>
              <td>{Number(row.totalTokens ?? 0).toLocaleString()}</td>
              <td>{Number(row.costUsd ?? 0).toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SeriesTable({
  title,
  rows,
  loading,
}: {
  title: string;
  rows: Array<{ date?: string; month?: string; costUsd: number; totalTokens?: number; requests?: number }>;
  loading?: boolean;
}) {
  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
  return (
    <div className="rounded-lg border bg-white">
      <h3 className="border-b px-4 py-2 text-sm font-medium">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-gray-500">
            <th className="px-4 py-2">Period</th>
            <th>Requests</th>
            <th>Tokens</th>
            <th>Cost (USD)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="px-4 py-2 font-mono text-xs">{row.date ?? row.month ?? '—'}</td>
              <td>{Number(row.requests ?? 0).toLocaleString()}</td>
              <td>{Number(row.totalTokens ?? 0).toLocaleString()}</td>
              <td>{Number(row.costUsd ?? 0).toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsageSummary({ entity }: { entity: UsageEntity }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Kpi label="Requests" value={entity.requests.toLocaleString()} />
      <Kpi label="Tokens" value={entity.totalTokens.toLocaleString()} />
      <Kpi label="Cost (USD)" value={entity.costUsd.toFixed(4)} />
    </div>
  );
}

/** @deprecated Use MonitoringCenterPanel */
export const UsageAnalyticsPanel = MonitoringCenterPanel;
