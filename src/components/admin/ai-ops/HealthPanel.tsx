'use client';

import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AiOpsResourceBoundary } from './AiOpsResourceBoundary';
import { useAiAdminResource } from './use-ai-admin-resource';

type HealthDashboard = {
  providers: Array<{
    provider: string;
    configured: boolean;
    reachable: boolean;
    latencyMs: number;
    errorCode?: string;
  }>;
  validations: Array<{ provider: string; valid: boolean; errors: string[] }>;
  budget: { status: string; remainingUsd?: number };
  recentSnapshots: Array<{
    provider: string;
    reachable: boolean;
    latencyMs: number;
    probedAt: string;
    errorCode: string | null;
  }>;
};

export function HealthPanel() {
  const { data, error, loading, reload } = useAiAdminResource<HealthDashboard>('/api/admin/ai-ops/health');

  return (
    <AiOpsResourceBoundary
      loading={loading && !data}
      error={error}
      reload={reload}
      loadingMessage="Running health probes…"
      hasData={!!data}
    >
      <div className="space-y-6">
        <AdminPageHeader
          title="Health"
          description="Live provider probes, configuration validation, and recent snapshots"
        />

      {data?.budget ? (
        <div className="rounded-lg border bg-white p-4 text-sm">
          <span className="text-gray-500">Budget status:</span>{' '}
          <span className="font-medium">{data.budget.status}</span>
          {data.budget.remainingUsd != null ? (
            <span className="ml-2 text-gray-600">
              (${data.budget.remainingUsd.toFixed(2)} remaining)
            </span>
          ) : null}
        </div>
      ) : null}

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-700">Provider probes</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-4 py-2">Provider</th>
              <th>Configured</th>
              <th>Reachable</th>
              <th>Latency</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {(data?.providers ?? []).map((p) => (
              <tr key={p.provider} className="border-b">
                <td className="px-4 py-2 font-mono text-xs">{p.provider}</td>
                <td>{p.configured ? 'Yes' : 'No'}</td>
                <td>
                  <span className={p.reachable ? 'text-green-700' : 'text-red-600'}>
                    {p.reachable ? 'OK' : 'Down'}
                  </span>
                </td>
                <td>{p.latencyMs}ms</td>
                <td className="text-xs text-red-600">{p.errorCode ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-700">Configuration validation</h2>
        <ul className="space-y-2">
          {(data?.validations ?? []).map((v) => (
            <li key={v.provider} className="rounded border bg-white px-4 py-2 text-sm">
              <span className="font-mono text-xs">{v.provider}</span>
              {' — '}
              <span className={v.valid ? 'text-green-700' : 'text-amber-700'}>
                {v.valid ? 'Valid' : 'Issues'}
              </span>
              {!v.valid && v.errors.length > 0 ? (
                <ul className="mt-1 list-inside list-disc text-xs text-gray-600">
                  {v.errors.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-700">Recent snapshots</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-4 py-2">Provider</th>
              <th>Reachable</th>
              <th>Latency</th>
              <th>Probed at</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recentSnapshots ?? []).slice(0, 10).map((s, i) => (
              <tr key={`${s.provider}-${s.probedAt}-${i}`} className="border-b">
                <td className="px-4 py-2 font-mono text-xs">{s.provider}</td>
                <td>{s.reachable ? 'Yes' : 'No'}</td>
                <td>{s.latencyMs}ms</td>
                <td className="text-gray-500">{new Date(s.probedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      </div>
    </AiOpsResourceBoundary>
  );
}
