'use client';

import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AiOpsResourceBoundary } from './AiOpsResourceBoundary';
import { EnabledBadge } from './ai-admin-badges';
import { aiAdminPost, useAiAdminResource } from './use-ai-admin-resource';

type Provider = {
  id: string;
  providerKey: string;
  displayName: string;
  enabled: boolean;
  priority: number;
  adapterType: string;
  healthScore: number;
  modelCount: number;
  apiKeyCount: number;
};

type ProviderDashboard = {
  health: Array<{ provider: string; configured: boolean; reachable: boolean; latencyMs: number }>;
  metrics: Array<{ provider: string; requests: number; costUsd: number }>;
};

export function ProviderPanel() {
  const { data: providers, error, loading, reload } = useAiAdminResource<Provider[]>(
    '/api/admin/ai-ops/providers',
  );
  const { data: dashboard } = useAiAdminResource<ProviderDashboard>(
    '/api/admin/ai-ops/providers/dashboard',
  );

  async function toggle(id: string, enabled: boolean) {
    await aiAdminPost(`/api/admin/ai-ops/providers/${id}/toggle`, { enabled });
    await reload();
  }

  const healthByKey = new Map((dashboard?.health ?? []).map((h) => [h.provider, h]));

  return (
    <AiOpsResourceBoundary
      loading={loading && !providers}
      error={error}
      reload={reload}
      loadingMessage="Loading providers…"
      hasData={!!providers}
    >
      <div className="space-y-4">
        <AdminPageHeader
          title="Providers"
          description="Registry of LLM providers — enable, prioritize, and monitor runtime health"
        />
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-4 py-2">Provider</th>
              <th>Adapter</th>
              <th>Priority</th>
              <th>Models</th>
              <th>Keys</th>
              <th>Runtime</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(providers ?? []).map((p) => {
              const h = healthByKey.get(p.providerKey);
              return (
                <tr key={p.id} className="border-b">
                  <td className="px-4 py-2">
                    <p className="font-medium">{p.displayName}</p>
                    <p className="font-mono text-xs text-gray-500">{p.providerKey}</p>
                  </td>
                  <td>{p.adapterType}</td>
                  <td>{p.priority}</td>
                  <td>{p.modelCount}</td>
                  <td>{p.apiKeyCount}</td>
                  <td>
                    {h ? (
                      <span className={h.reachable ? 'text-green-700' : 'text-red-600'}>
                        {h.reachable ? `OK (${h.latencyMs}ms)` : 'Unreachable'}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td>
                    <EnabledBadge enabled={p.enabled} />
                  </td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      className="text-sm text-blue-600"
                      onClick={() => void toggle(p.id, !p.enabled)}
                    >
                      {p.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AiOpsResourceBoundary>
  );
}
