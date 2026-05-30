'use client';

import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AiOpsResourceBoundary } from './AiOpsResourceBoundary';
import { EnabledBadge } from './ai-admin-badges';
import { aiAdminPost, useAiAdminResource } from './use-ai-admin-resource';

type Route = {
  id: string;
  routeKey: string;
  name: string;
  taskType: string;
  enabled: boolean;
  priority: number;
  primaryProviderKey: string | null;
  primaryModelKey: string | null;
  maxRetries: number;
  timeoutMs: number;
  failoverRuleCount: number;
};

export function RoutePanel() {
  const { data, error, loading, reload } = useAiAdminResource<Route[]>('/api/admin/ai-ops/routes');

  async function toggle(id: string, enabled: boolean) {
    await aiAdminPost(`/api/admin/ai-ops/routes/${id}/toggle`, { enabled });
    await reload();
  }

  return (
    <AiOpsResourceBoundary
      loading={loading && !data}
      error={error}
      reload={reload}
      loadingMessage="Loading routing rules…"
      hasData={!!data}
    >
      <div className="space-y-4">
        <AdminPageHeader
          title="Routing"
          description="Task-type routing rules with provider/model chains and failover bindings"
        />
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <th className="px-4 py-2">Route</th>
            <th>Task type</th>
            <th>Primary</th>
            <th>Priority</th>
            <th>Retries</th>
            <th>Timeout</th>
            <th>Failover rules</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((r) => (
            <tr key={r.id} className="border-b">
              <td className="px-4 py-2">
                <p className="font-medium">{r.name}</p>
                <p className="font-mono text-xs text-gray-500">{r.routeKey}</p>
              </td>
              <td className="font-mono text-xs">{r.taskType}</td>
              <td className="text-xs">
                {r.primaryProviderKey ?? '—'}
                {r.primaryModelKey ? ` / ${r.primaryModelKey}` : ''}
              </td>
              <td>{r.priority}</td>
              <td>{r.maxRetries}</td>
              <td>{r.timeoutMs}ms</td>
              <td>{r.failoverRuleCount}</td>
              <td>
                <EnabledBadge enabled={r.enabled} />
              </td>
              <td className="py-2 text-right">
                <button
                  type="button"
                  className="text-sm text-blue-600"
                  onClick={() => void toggle(r.id, !r.enabled)}
                >
                  {r.enabled ? 'Disable' : 'Enable'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </AiOpsResourceBoundary>
  );
}
