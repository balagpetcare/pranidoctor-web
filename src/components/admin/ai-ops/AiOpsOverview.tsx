'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';

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
  if (!data) return <AdminLoadingState message="Loading AI dashboard…" />;

  const usage = data.usage?.totals;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="AI Operations" description="Phase 8 ecosystem metrics" />

      {usage ? (
        <section>
          <h2 className="mb-3 text-sm font-medium text-gray-700">LLM usage (30 days)</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Kpi label="Total requests" value={usage.requests} />
            <Kpi label="Total tokens" value={usage.totalTokens.toLocaleString()} />
            <Kpi label="Billable tokens" value={usage.billableTokens.toLocaleString()} />
            <Kpi label="Success rate" value={`${usage.successRate}%`} />
            <Kpi label="Failure rate" value={`${usage.failureRate}%`} />
            <Kpi label="Avg latency" value={`${usage.avgLatencyMs} ms`} />
            <Kpi label="Est. cost (USD)" value={usage.costUsd.toFixed(4)} />
            <Kpi label="Billable cost (USD)" value={usage.billableCostUsd.toFixed(4)} />
            <Kpi label="Fallback responses" value={usage.fallbackCount} />
            <Kpi label="Input tokens" value={usage.inputTokens.toLocaleString()} />
            <Kpi label="Output tokens" value={usage.outputTokens.toLocaleString()} />
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
