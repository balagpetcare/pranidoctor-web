'use client';

import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AiOpsResourceBoundary } from './AiOpsResourceBoundary';
import { useAiAdminResource } from './use-ai-admin-resource';
import { EnabledBadge, CircuitBadge } from './ai-admin-badges';

type OperationsDashboard = {
  summary: {
    providerCount: number;
    enabledProviders: number;
    degradedProviders: number;
    modelCount: number;
    enabledModels: number;
    routeCount: number;
    enabledRoutes: number;
  };
  providers: Array<{
    id: string;
    providerKey: string;
    displayName: string;
    enabled: boolean;
    healthScore: number | null;
    lastHealthCheckAt: string | null;
    modelCount: number;
    apiKeyCount: number;
  }>;
  models: Array<{
    id: string;
    providerKey: string;
    modelKey: string;
    displayName: string;
    enabled: boolean;
    isDefault: boolean;
  }>;
  routes: Array<{
    id: string;
    routeKey: string;
    name: string;
    taskType: string;
    enabled: boolean;
    fallbackToRules: boolean;
  }>;
  failover: unknown;
  health: unknown;
};

export function OperationsCenterPanel() {
  const { data, error, loading, reload } = useAiAdminResource<OperationsDashboard>(
    '/api/admin/ai-ops/operations/dashboard',
  );

  const s = data?.summary;

  return (
    <AiOpsResourceBoundary
      loading={loading && !data}
      error={error}
      reload={reload}
      loadingMessage="Loading operations dashboard…"
      hasData={!!data}
    >
      <div className="space-y-6">
        <AdminPageHeader
          title="Operations Center"
          description="Provider health, availability, models, routes, and failover status"
        />

        {s ? (
          <div className="grid gap-4 md:grid-cols-4">
            <Kpi label="Providers" value={`${s.enabledProviders}/${s.providerCount}`} />
            <Kpi label="Degraded" value={s.degradedProviders} />
            <Kpi label="Models" value={`${s.enabledModels}/${s.modelCount}`} />
            <Kpi label="Routes" value={`${s.enabledRoutes}/${s.routeCount}`} />
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-2">
          <OpsTable
            title="Provider health"
            headers={['Provider', 'Health', 'Keys', 'Models', 'Status']}
            rows={(data?.providers ?? []).map((p) => [
              p.providerKey,
              p.healthScore ?? '—',
              p.apiKeyCount,
              p.modelCount,
              p.enabled ? 'on' : 'off',
            ])}
          />
          <OpsTable
            title="Models"
            headers={['Model', 'Provider', 'Default', 'Status']}
            rows={(data?.models ?? []).slice(0, 20).map((m) => [
              m.modelKey,
              m.providerKey,
              m.isDefault ? 'yes' : '—',
              m.enabled ? 'on' : 'off',
            ])}
          />
        </section>

        <OpsTable
          title="Routes"
          headers={['Route', 'Task', 'Rules fallback', 'Status']}
          rows={(data?.routes ?? []).map((r) => [
            r.routeKey,
            r.taskType,
            r.fallbackToRules ? 'yes' : 'no',
            r.enabled ? 'on' : 'off',
          ])}
        />

        <div className="rounded-lg border bg-white p-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            Failover & circuit status <CircuitBadge state="closed" />
          </h3>
          <pre className="mt-2 max-h-48 overflow-auto text-xs text-gray-600">
            {JSON.stringify(data?.failover ?? {}, null, 2)}
          </pre>
        </div>
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

function OpsTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <div className="rounded-lg border bg-white">
      <h3 className="border-b px-4 py-2 text-sm font-medium">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-gray-500">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 font-mono text-xs">
                  {cell === 'on' || cell === 'off' ? (
                    <EnabledBadge enabled={cell === 'on'} />
                  ) : (
                    String(cell)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
