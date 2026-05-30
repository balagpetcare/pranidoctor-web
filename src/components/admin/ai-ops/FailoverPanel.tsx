'use client';

import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { CircuitBadge, EnabledBadge } from './ai-admin-badges';
import { aiAdminPost, useAiAdminResource } from './use-ai-admin-resource';

type FailoverRule = {
  id: string;
  name: string;
  routeKey: string | null;
  triggerType: string;
  action: string;
  fromProviderKey: string | null;
  toProviderKey: string | null;
  enabled: boolean;
  priority: number;
};

type FailoverStatus = {
  circuitBreakers: Array<{
    providerKey: string;
    circuitState: string;
    reachable: boolean;
    consecutiveFailures: number;
    healthScore: number;
  }>;
  rules: FailoverRule[];
  activeRules: number;
};

export function FailoverPanel() {
  const { data: status, error, loading, reload } = useAiAdminResource<FailoverStatus>(
    '/api/admin/ai-ops/failover/status',
  );

  async function toggleRule(id: string, enabled: boolean) {
    await aiAdminPost(`/api/admin/ai-ops/failover/${id}/toggle`, { enabled });
    await reload();
  }

  if (loading && !status) return <AdminLoadingState message="Loading failover…" />;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Failover"
        description="Circuit breaker state and failover rule configuration"
      />

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-700">Circuit breakers</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-4 py-2">Provider</th>
              <th>Circuit</th>
              <th>Reachable</th>
              <th>Failures</th>
              <th>Health</th>
            </tr>
          </thead>
          <tbody>
            {(status?.circuitBreakers ?? []).map((c) => (
              <tr key={c.providerKey} className="border-b">
                <td className="px-4 py-2 font-mono text-xs">{c.providerKey}</td>
                <td>
                  <CircuitBadge state={c.circuitState} />
                </td>
                <td>{c.reachable ? 'Yes' : 'No'}</td>
                <td>{c.consecutiveFailures}</td>
                <td>{(c.healthScore * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(status?.circuitBreakers ?? []).length === 0 ? (
          <p className="text-sm text-gray-500">No circuit breaker snapshots yet.</p>
        ) : null}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-gray-700">
          Failover rules ({status?.activeRules ?? 0} active)
        </h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-4 py-2">Rule</th>
              <th>Route</th>
              <th>Trigger</th>
              <th>Action</th>
              <th>From → To</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(status?.rules ?? []).map((r) => (
              <tr key={r.id} className="border-b">
                <td className="px-4 py-2 font-medium">{r.name}</td>
                <td className="font-mono text-xs">{r.routeKey ?? 'global'}</td>
                <td className="text-xs">{r.triggerType}</td>
                <td className="text-xs">{r.action}</td>
                <td className="text-xs">
                  {r.fromProviderKey ?? '*'} → {r.toProviderKey ?? '*'}
                </td>
                <td>
                  <EnabledBadge enabled={r.enabled} />
                </td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    className="text-sm text-blue-600"
                    onClick={() => void toggleRule(r.id, !r.enabled)}
                  >
                    {r.enabled ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
