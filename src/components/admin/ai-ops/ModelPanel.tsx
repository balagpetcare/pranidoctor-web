'use client';

import { useMemo, useState } from 'react';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AiOpsResourceBoundary } from './AiOpsResourceBoundary';
import { EnabledBadge } from './ai-admin-badges';
import { aiAdminPost, useAiAdminResource } from './use-ai-admin-resource';

type ModelFamily = 'gpt' | 'gemini' | 'claude' | 'deepseek' | 'qwen' | 'llama' | 'grok';

type Model = {
  id: string;
  providerId: string;
  providerKey: string;
  providerName: string;
  modelKey: string;
  displayName: string;
  modelFamily: ModelFamily | null;
  modelType: string;
  contextWindow: number | null;
  enabled: boolean;
  isDefault: boolean;
  lifecycle: 'registered' | 'enabled' | 'deprecated' | 'retired';
  capabilities: string[];
  economics: {
    inputCostPerToken: number;
    outputCostPerToken: number;
    rateVersion: number;
    currency: string;
  };
};

type FamilySummary = {
  family: ModelFamily;
  displayName: string;
  modelCount: number;
  enabledCount: number;
  providers: string[];
};

const FAMILY_LABELS: Record<ModelFamily, string> = {
  gpt: 'GPT',
  gemini: 'Gemini',
  claude: 'Claude',
  deepseek: 'DeepSeek',
  qwen: 'Qwen',
  llama: 'Llama',
  grok: 'Grok',
};

export function ModelPanel() {
  const [familyFilter, setFamilyFilter] = useState<ModelFamily | ''>('');
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const modelsUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (familyFilter) params.set('modelFamily', familyFilter);
    const qs = params.toString();
    return qs ? `/api/admin/ai-ops/models?${qs}` : '/api/admin/ai-ops/models';
  }, [familyFilter]);

  const { data, error, loading, reload } = useAiAdminResource<Model[]>(modelsUrl);
  const { data: families } = useAiAdminResource<FamilySummary[]>('/api/admin/ai-ops/models/families');

  async function enableModel(id: string) {
    setBusyId(id);
    setMessage(null);
    try {
      await aiAdminPost(`/api/admin/ai-ops/models/${id}/enable`, {});
      await reload();
      setMessage('Model enabled');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Enable failed');
    } finally {
      setBusyId(null);
    }
  }

  async function disableModel(id: string) {
    setBusyId(id);
    try {
      await aiAdminPost(`/api/admin/ai-ops/models/${id}/disable`, {});
      await reload();
    } finally {
      setBusyId(null);
    }
  }

  async function syncManifests() {
    setMessage(null);
    try {
      const res = await aiAdminPost<{ upserted: number }>(
        '/api/admin/ai-ops/models/sync/manifests',
        {},
      );
      await reload();
      setMessage(`Synced ${res.upserted} manifest entries`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Sync failed');
    }
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
          title="Model Registry"
          description="Canonical model catalog — family, capabilities, economics, and provider mapping"
        />

        {message ? <p className="text-sm text-gray-600">{message}</p> : null}

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-gray-600">
            Family
            <select
              className="ml-2 rounded border px-2 py-1 text-sm"
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value as ModelFamily | '')}
            >
              <option value="">All families</option>
              {(families ?? []).map((f) => (
                <option key={f.family} value={f.family}>
                  {FAMILY_LABELS[f.family]} ({f.enabledCount}/{f.modelCount})
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
            onClick={() => void syncManifests()}
          >
            Sync manifests
          </button>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-4 py-2">Model</th>
              <th>Family</th>
              <th>Provider</th>
              <th>Type</th>
              <th>Context</th>
              <th>Capabilities</th>
              <th>Input $/tok</th>
              <th>Rate v</th>
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
                <td>{m.modelFamily ? FAMILY_LABELS[m.modelFamily] : '—'}</td>
                <td>{m.providerName}</td>
                <td>{m.modelType}</td>
                <td>{m.contextWindow?.toLocaleString() ?? '—'}</td>
                <td className="max-w-[12rem] truncate text-xs" title={m.capabilities.join(', ')}>
                  {m.capabilities.join(', ') || '—'}
                </td>
                <td className="font-mono text-xs">{m.economics.inputCostPerToken}</td>
                <td className="font-mono text-xs">{m.economics.rateVersion}</td>
                <td>{m.isDefault ? 'Yes' : '—'}</td>
                <td>
                  <EnabledBadge enabled={m.enabled} />
                  {m.lifecycle === 'deprecated' ? (
                    <span className="ml-1 text-xs text-amber-600">deprecated</span>
                  ) : null}
                </td>
                <td className="py-2 text-right">
                  {m.enabled ? (
                    <button
                      type="button"
                      className="text-sm text-blue-600 disabled:opacity-50"
                      disabled={busyId === m.id}
                      onClick={() => void disableModel(m.id)}
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-sm text-blue-600 disabled:opacity-50"
                      disabled={busyId === m.id}
                      onClick={() => void enableModel(m.id)}
                    >
                      Enable
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AiOpsResourceBoundary>
  );
}
