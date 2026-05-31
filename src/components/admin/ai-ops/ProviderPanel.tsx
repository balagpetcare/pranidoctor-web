'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AiOpsResourceBoundary } from './AiOpsResourceBoundary';
import { EnabledBadge } from './ai-admin-badges';
import { aiAdminPost, useAiAdminResource } from './use-ai-admin-resource';

type Provider = {
  id: string;
  providerKey: string;
  displayName: string;
  enabled: boolean;
  effectiveStatus: 'ACTIVE' | 'DEGRADED' | 'DISABLED' | 'UNCONFIGURED' | 'BLOCKED';
  priority: number;
  adapterType: string;
  healthScore: number;
  modelCount: number;
  apiKeyCount: number;
  lastConnectionTestAt: string | null;
  lastConnectionTestOk: boolean | null;
  keySummary: {
    hasPrimary: boolean;
    hint: string | null;
    pendingTestCount: number;
  };
};

type ProviderDashboard = {
  health: Array<{ provider: string; configured: boolean; reachable: boolean; latencyMs: number }>;
  metrics: Array<{ provider: string; requests: number; costUsd: number }>;
};

const STATUS_COLORS: Record<Provider['effectiveStatus'], string> = {
  ACTIVE: 'text-green-700',
  DEGRADED: 'text-amber-700',
  DISABLED: 'text-gray-500',
  UNCONFIGURED: 'text-orange-600',
  BLOCKED: 'text-red-700',
};

export type ProviderPanelProps = Readonly<{
  canManageSecrets?: boolean;
}>;

export function ProviderPanel({ canManageSecrets = false }: ProviderPanelProps) {
  const { data: providers, error, loading, reload } = useAiAdminResource<Provider[]>(
    '/api/admin/ai-ops/providers',
  );
  const { data: dashboard } = useAiAdminResource<ProviderDashboard>(
    '/api/admin/ai-ops/providers/dashboard',
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function enableProvider(id: string) {
    setBusyId(id);
    setMessage(null);
    try {
      await aiAdminPost(`/api/admin/ai-ops/providers/${id}/enable`, {});
      await reload();
      setMessage('Provider enabled');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Enable failed');
    } finally {
      setBusyId(null);
    }
  }

  async function disableProvider(id: string) {
    setBusyId(id);
    try {
      await aiAdminPost(`/api/admin/ai-ops/providers/${id}/disable`, {});
      await reload();
    } finally {
      setBusyId(null);
    }
  }

  async function testConnection(id: string) {
    if (!canManageSecrets) return;
    setBusyId(id);
    setMessage(null);
    try {
      const result = await aiAdminPost<{ ok: boolean; latencyMs?: number; message?: string }>(
        `/api/admin/ai-ops/providers/${id}/test-connection`,
        {},
      );
      setMessage(
        result.ok
          ? `Connection OK${result.latencyMs != null ? ` (${result.latencyMs} ms)` : ''}`
          : (result.message ?? 'Connection test failed'),
      );
      await reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Test failed');
    } finally {
      setBusyId(null);
    }
  }

  async function movePriority(id: string, direction: 'up' | 'down') {
    const list = [...(providers ?? [])].sort((a, b) => a.priority - b.priority);
    const idx = list.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    const a = list[idx]!;
    const b = list[swapIdx]!;
    setBusyId(id);
    try {
      await fetch('/api/admin/ai-ops/providers/priority', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: a.id, priority: b.priority },
            { id: b.id, priority: a.priority },
          ],
        }),
      });
      await reload();
    } finally {
      setBusyId(null);
    }
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
          description="Registry of LLM providers — enable requires a tested primary API key"
        />
        {message ? <p className="text-sm text-gray-700">{message}</p> : null}
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-4 py-2">Provider</th>
              <th>Adapter</th>
              <th>Priority</th>
              <th>Key</th>
              <th>Effective</th>
              <th>Runtime</th>
              <th>Registry</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(providers ?? []).map((p) => {
              const h = healthByKey.get(p.providerKey);
              return (
                <tr key={p.id} className="border-b align-top">
                  <td className="px-4 py-2">
                    <p className="font-medium">{p.displayName}</p>
                    <p className="font-mono text-xs text-gray-500">{p.providerKey}</p>
                  </td>
                  <td>{p.adapterType}</td>
                  <td>
                    <span className="font-mono">{p.priority}</span>
                    <span className="ml-2 inline-flex gap-1">
                      <button
                        type="button"
                        className="text-xs text-gray-500"
                        disabled={busyId === p.id}
                        onClick={() => void movePriority(p.id, 'up')}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="text-xs text-gray-500"
                        disabled={busyId === p.id}
                        onClick={() => void movePriority(p.id, 'down')}
                      >
                        ↓
                      </button>
                    </span>
                  </td>
                  <td className="text-xs">
                    {p.keySummary.hasPrimary ? (
                      <span className="font-mono">{p.keySummary.hint ?? '****'}</span>
                    ) : p.keySummary.pendingTestCount > 0 ? (
                      <span className="text-amber-700">Pending test</span>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className={STATUS_COLORS[p.effectiveStatus]}>{p.effectiveStatus}</td>
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
                    <span className="inline-flex flex-wrap justify-end gap-2">
                      {canManageSecrets ? (
                        <button
                          type="button"
                          className="text-sm text-blue-600 disabled:opacity-50"
                          disabled={busyId === p.id}
                          onClick={() => void testConnection(p.id)}
                        >
                          Test
                        </button>
                      ) : null}
                      {p.enabled ? (
                        <button
                          type="button"
                          className="text-sm text-amber-700"
                          disabled={busyId === p.id}
                          onClick={() => void disableProvider(p.id)}
                        >
                          Disable
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="text-sm text-green-700 disabled:opacity-50"
                          disabled={busyId === p.id || p.effectiveStatus === 'BLOCKED'}
                          onClick={() => void enableProvider(p.id)}
                        >
                          Enable
                        </button>
                      )}
                    </span>
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
