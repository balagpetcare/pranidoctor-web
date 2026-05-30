'use client';

import Link from 'next/link';
import {
  BarChart3,
  Key,
  Layers,
  ListTree,
  ScrollText,
  Settings,
  ShieldCheck,
  Store,
} from 'lucide-react';

import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AiOpsResourceBoundary } from './AiOpsResourceBoundary';
import { useAiAdminResource } from './use-ai-admin-resource';

type UsageTotals = {
  requests: number;
  successes: number;
  failures: number;
  successRate: number;
  failureRate: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  billableTokens: number;
  costUsd: number;
  billableCostUsd: number;
  avgLatencyMs: number;
  fallbackCount: number;
};

type ConsumerRow = {
  userId?: string;
  customerId?: string;
  totalTokens: number;
  billableTokens: number;
  costUsd: number;
};

type Overview = {
  since: string;
  usage: {
    totals: UsageTotals;
    byModel: Array<{
      provider: string;
      model: string;
      requests: number;
      totalTokens: number;
      billableTokens: number;
      costUsd: number;
    }>;
    topUsers: ConsumerRow[];
    topCustomers: ConsumerRow[];
  };
  sessions: { chat: number; triage: number; symptomChecks: number };
  escalations: number;
  recommendations: number;
  avgHerdHealth: number | null;
};

type Provider = { id: string; enabled: boolean };
type HealthDashboard = {
  providers?: Array<{ reachable: boolean }>;
  budget?: { status: string };
};

const QUICK_LINKS = [
  { href: '/admin/ai-ops/providers', label: 'Providers', icon: Layers },
  { href: '/admin/ai-ops/routes', label: 'Routing', icon: ListTree },
  { href: '/admin/ai-ops/api-keys', label: 'API Keys', icon: Key },
  { href: '/admin/ai-ops/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/ai-ops/marketplace', label: 'Marketplace', icon: Store },
  { href: '/admin/ai-ops/health', label: 'Health', icon: ShieldCheck },
  { href: '/admin/ai-ops/logs', label: 'Logs', icon: ScrollText },
  { href: '/admin/ai-ops/settings', label: 'Settings', icon: Settings },
] as const;

export function AiOpsOverview() {
  const overview = useAiAdminResource<Overview>('/api/admin/ai-ops/overview');
  const providers = useAiAdminResource<Provider[]>('/api/admin/ai-ops/providers');
  const health = useAiAdminResource<HealthDashboard>('/api/admin/ai-ops/health');

  const loading = overview.loading && !overview.data;
  const error = overview.error;
  const data = overview.data;

  return (
    <AiOpsResourceBoundary
      loading={loading}
      error={error}
      reload={overview.reload}
      loadingMessage="Loading AI Center dashboard…"
      hasData={!!data}
    >
      {data ? (
        <div className="space-y-6">
          <AdminPageHeader
            title="AI Center"
            description="Operating system overview — usage, health, and quick navigation"
          />

          <section>
            <h2 className="mb-3 text-sm font-medium text-gray-700">Summary</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                label="Requests (30d)"
                value={data.usage?.totals?.requests?.toLocaleString() ?? '—'}
              />
              <SummaryCard
                label="Est. cost (USD)"
                value={data.usage?.totals ? data.usage.totals.costUsd.toFixed(4) : '—'}
              />
              <SummaryCard
                label="Active providers"
                value={
                  providers.data
                    ? `${providers.data.filter((p) => p.enabled).length} / ${providers.data.length}`
                    : providers.loading
                      ? '…'
                      : '—'
                }
              />
              <SummaryCard
                label="System health"
                value={
                  health.data?.providers
                    ? `${health.data.providers.filter((p) => p.reachable).length}/${health.data.providers.length} OK`
                    : health.data?.budget?.status ?? (health.loading ? '…' : '—')
                }
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-medium text-gray-700">Quick links</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow"
                >
                  <Icon className="h-5 w-5 text-blue-600" aria-hidden />
                  <span className="text-sm font-medium text-gray-800">{label}</span>
                </Link>
              ))}
            </div>
          </section>

          {data.usage?.totals ? (
            <section>
              <h2 className="mb-3 text-sm font-medium text-gray-700">LLM usage (30 days)</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <Kpi label="Total requests" value={data.usage.totals.requests} />
                <Kpi label="Total tokens" value={data.usage.totals.totalTokens.toLocaleString()} />
                <Kpi label="Billable tokens" value={data.usage.totals.billableTokens.toLocaleString()} />
                <Kpi label="Success rate" value={`${data.usage.totals.successRate}%`} />
                <Kpi label="Failure rate" value={`${data.usage.totals.failureRate}%`} />
                <Kpi label="Avg latency" value={`${data.usage.totals.avgLatencyMs} ms`} />
                <Kpi label="Est. cost (USD)" value={data.usage.totals.costUsd.toFixed(4)} />
                <Kpi label="Billable cost (USD)" value={data.usage.totals.billableCostUsd.toFixed(4)} />
                <Kpi label="Fallback responses" value={data.usage.totals.fallbackCount} />
              </div>
              {data.usage.byModel.length > 0 ? (
                <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
                  <table className="min-w-full text-sm">
                    <thead className="border-b bg-gray-50 text-left text-gray-600">
                      <tr>
                        <th className="px-4 py-2">Provider</th>
                        <th className="px-4 py-2">Model</th>
                        <th className="px-4 py-2">Requests</th>
                        <th className="px-4 py-2">Total tokens</th>
                        <th className="px-4 py-2">Billable tokens</th>
                        <th className="px-4 py-2">Est. cost (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.usage.byModel.map((row) => (
                        <tr key={`${row.provider}-${row.model}`} className="border-b last:border-0">
                          <td className="px-4 py-2">{row.provider}</td>
                          <td className="px-4 py-2 font-mono text-xs">{row.model}</td>
                          <td className="px-4 py-2">{row.requests}</td>
                          <td className="px-4 py-2">{row.totalTokens.toLocaleString()}</td>
                          <td className="px-4 py-2">{row.billableTokens.toLocaleString()}</td>
                          <td className="px-4 py-2">{row.costUsd.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              <ConsumerTables
                topUsers={data.usage.topUsers ?? []}
                topCustomers={data.usage.topCustomers ?? []}
              />
            </section>
          ) : null}

          <section>
            <h2 className="mb-3 text-sm font-medium text-gray-700">Ecosystem activity</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Kpi label="Chat sessions" value={data.sessions.chat} />
              <Kpi label="Symptom checks" value={data.sessions.symptomChecks} />
              <Kpi label="Escalations" value={data.escalations} />
              <Kpi label="Smart recommendations" value={data.recommendations} />
              <Kpi label="Avg herd health" value={data.avgHerdHealth ?? '—'} />
            </div>
          </section>
        </div>
      ) : null}
    </AiOpsResourceBoundary>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function ConsumerTables({
  topUsers,
  topCustomers,
}: {
  topUsers: ConsumerRow[];
  topCustomers: ConsumerRow[];
}) {
  if (topUsers.length === 0 && topCustomers.length === 0) return null;

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      {topUsers.length > 0 ? (
        <ConsumerTable title="Top users by billable tokens" rows={topUsers} idKey="userId" />
      ) : null}
      {topCustomers.length > 0 ? (
        <ConsumerTable
          title="Top tenants by billable tokens"
          rows={topCustomers}
          idKey="customerId"
        />
      ) : null}
    </div>
  );
}

function ConsumerTable({
  title,
  rows,
  idKey,
}: {
  title: string;
  rows: ConsumerRow[];
  idKey: 'userId' | 'customerId';
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <p className="border-b px-4 py-2 text-sm font-medium text-gray-700">{title}</p>
      <table className="min-w-full text-sm">
        <thead className="border-b bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Billable tokens</th>
            <th className="px-4 py-2">Total tokens</th>
            <th className="px-4 py-2">Cost (USD)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[idKey]} className="border-b last:border-0">
              <td className="max-w-[8rem] truncate px-4 py-2 font-mono text-xs">{row[idKey]}</td>
              <td className="px-4 py-2">{row.billableTokens.toLocaleString()}</td>
              <td className="px-4 py-2">{row.totalTokens.toLocaleString()}</td>
              <td className="px-4 py-2">{row.costUsd.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
