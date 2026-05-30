'use client';

import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AiOpsResourceBoundary } from './AiOpsResourceBoundary';
import { EnabledBadge } from './ai-admin-badges';
import { aiAdminPost, useAiAdminResource } from './use-ai-admin-resource';

type Model = {
  id: string;
  providerKey: string;
  providerName: string;
  modelKey: string;
  displayName: string;
  modelType: string;
  contextWindow: number | null;
  inputCostPerToken: number;
  outputCostPerToken: number;
  enabled: boolean;
  isDefault: boolean;
};

export function ModelPanel() {
  const { data, error, loading, reload } = useAiAdminResource<Model[]>('/api/admin/ai-ops/models');

  async function toggle(id: string, enabled: boolean) {
    await aiAdminPost(`/api/admin/ai-ops/models/${id}/toggle`, { enabled });
    await reload();
  }

  return (
    <AiOpsResourceBoundary
      loading={loading && !data}
      error={error}
      reload={reload}
      loadingMessage="Loading models…"
      hasData={!!data}
    >
      <div className="space-y-4">
        <AdminPageHeader
          title="Models"
          description="Provider model catalog with cost rates and enablement"
        />
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <th className="px-4 py-2">Model</th>
            <th>Provider</th>
            <th>Type</th>
            <th>Context</th>
            <th>Input $/tok</th>
            <th>Output $/tok</th>
            <th>Default</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((m) => (
            <tr key={m.id} className="border-b">
              <td className="px-4 py-2">
                <p className="font-medium">{m.displayName}</p>
                <p className="font-mono text-xs text-gray-500">{m.modelKey}</p>
              </td>
              <td>{m.providerName}</td>
              <td>{m.modelType}</td>
              <td>{m.contextWindow?.toLocaleString() ?? '—'}</td>
              <td className="font-mono text-xs">{m.inputCostPerToken}</td>
              <td className="font-mono text-xs">{m.outputCostPerToken}</td>
              <td>{m.isDefault ? 'Yes' : '—'}</td>
              <td>
                <EnabledBadge enabled={m.enabled} />
              </td>
              <td className="py-2 text-right">
                <button
                  type="button"
                  className="text-sm text-blue-600"
                  onClick={() => void toggle(m.id, !m.enabled)}
                >
                  {m.enabled ? 'Disable' : 'Enable'}
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
