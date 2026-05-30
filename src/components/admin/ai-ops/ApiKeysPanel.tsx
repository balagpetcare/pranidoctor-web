'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AiOpsResourceBoundary } from './AiOpsResourceBoundary';
import { aiAdminPost, useAiAdminResource } from './use-ai-admin-resource';

type ApiKey = {
  id: string;
  providerKey: string;
  name: string;
  status: string;
  secretHint: string | null;
  expiresAt: string | null;
  lastUsedAt: string | null;
  rotatedAt: string | null;
};

export type ApiKeysPanelProps = Readonly<{
  canManageSecrets?: boolean;
}>;

export function ApiKeysPanel({ canManageSecrets = false }: ApiKeysPanelProps) {
  const { data, error, loading, reload } = useAiAdminResource<ApiKey[]>('/api/admin/ai-ops/secrets');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function testKey(id: string) {
    setBusyId(id);
    setMessage(null);
    try {
      const result = await aiAdminPost<{ ok: boolean; message?: string }>(
        `/api/admin/ai-ops/secrets/${id}/test`,
      );
      setMessage(result.ok ? 'Key test passed' : (result.message ?? 'Key test failed'));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Test failed');
    } finally {
      setBusyId(null);
    }
  }

  async function disableKey(id: string) {
    setBusyId(id);
    try {
      await aiAdminPost(`/api/admin/ai-ops/secrets/${id}/disable`, {});
      await reload();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AiOpsResourceBoundary
      loading={loading && !data}
      error={error}
      reload={reload}
      loadingMessage="Loading API keys…"
      hasData={!!data}
    >
      <div className="space-y-4">
        <AdminPageHeader
          title="API Keys"
          description={
            canManageSecrets
              ? 'Encrypted provider credentials — test and revoke keys in the vault'
              : 'Read-only view — SUPER_ADMIN required to add or rotate keys'
          }
        />
        {message ? <p className="text-sm text-gray-700">{message}</p> : null}
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-4 py-2">Name</th>
              <th>Provider</th>
              <th>Hint</th>
              <th>Status</th>
              <th>Last used</th>
              {canManageSecrets ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((k) => (
              <tr key={k.id} className="border-b">
                <td className="px-4 py-2 font-medium">{k.name}</td>
                <td className="font-mono text-xs">{k.providerKey}</td>
                <td className="font-mono text-xs">{k.secretHint ?? '****'}</td>
                <td>{k.status}</td>
                <td className="text-gray-500">
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : '—'}
                </td>
                {canManageSecrets ? (
                  <td className="py-2 text-right">
                    <span className="inline-flex gap-3">
                      <button
                        type="button"
                        className="text-sm text-blue-600 disabled:opacity-50"
                        disabled={busyId === k.id}
                        onClick={() => void testKey(k.id)}
                      >
                        Test
                      </button>
                      {k.status === 'ACTIVE' ? (
                        <button
                          type="button"
                          className="text-sm text-red-600 disabled:opacity-50"
                          disabled={busyId === k.id}
                          onClick={() => void disableKey(k.id)}
                        >
                          Revoke
                        </button>
                      ) : null}
                    </span>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
        {(data ?? []).length === 0 ? (
          <p className="text-sm text-gray-500">No API keys configured.</p>
        ) : null}
      </div>
    </AiOpsResourceBoundary>
  );
}
