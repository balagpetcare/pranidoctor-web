'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AiOpsResourceBoundary } from './AiOpsResourceBoundary';
import { aiAdminPost, useAiAdminResource } from './use-ai-admin-resource';
import { EnabledBadge, PlaceholderKeyBadge } from './ai-admin-badges';

type ApiKey = {
  id: string;
  providerKey: string;
  name: string;
  status: string;
  isPlaceholder?: boolean;
  isPrimary?: boolean;
  secretHint: string | null;
  expiresAt: string | null;
  lastUsedAt: string | null;
  rotatedAt: string | null;
};

type AuditEntry = {
  id: string;
  action: string;
  createdAt: string;
  actorUserId?: string | null;
};

const PROVIDERS = ['openai', 'anthropic', 'gemini', 'groq', 'deepseek', 'openrouter', 'grok', 'self_hosted'];

export type ApiKeysPanelProps = Readonly<{
  /** Create, rotate, set primary — SUPER_ADMIN only. */
  canManageSecrets?: boolean;
  /** List, test, disable, audit — SUPER_ADMIN and ADMIN. */
  canOperateSecrets?: boolean;
}>;

export function ApiKeysPanel({
  canManageSecrets = false,
  canOperateSecrets = false,
}: ApiKeysPanelProps) {
  const { data, error, loading, reload } = useAiAdminResource<ApiKey[]>('/api/admin/ai-ops/secrets');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [auditRows, setAuditRows] = useState<AuditEntry[]>([]);
  const [form, setForm] = useState({ providerKey: 'openai', name: '', secret: '' });
  const [rotateSecret, setRotateSecret] = useState('');
  const [replaceKeyId, setReplaceKeyId] = useState<string | null>(null);

  async function testKey(id: string) {
    setBusyId(id);
    setMessage(null);
    try {
      const result = await aiAdminPost<{ ok: boolean; message?: string; latencyMs?: number }>(
        `/api/admin/ai-ops/secrets/${id}/test`,
      );
      setMessage(
        result.ok
          ? `Key test passed${result.latencyMs != null ? ` (${result.latencyMs} ms)` : ''}`
          : (result.message ?? 'Key test failed'),
      );
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

  async function createKey() {
    setBusyId('create');
    setMessage(null);
    try {
      await aiAdminPost('/api/admin/ai-ops/secrets', form);
      setShowCreate(false);
      setForm({ providerKey: 'openai', name: '', secret: '' });
      await reload();
      setMessage('API key saved — run Test to activate');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to add key');
    } finally {
      setBusyId(null);
    }
  }

  async function rotateKey(id: string) {
    if (!rotateSecret || rotateSecret.length < 20) {
      setMessage('New secret must be at least 20 characters');
      return;
    }
    setBusyId(id);
    try {
      await aiAdminPost(`/api/admin/ai-ops/secrets/${id}/rotate`, { secret: rotateSecret });
      setRotateSecret('');
      setReplaceKeyId(null);
      await reload();
      setMessage('Key replaced — run Test to verify connectivity');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Rotate failed');
    } finally {
      setBusyId(null);
    }
  }

  async function setPrimary(id: string) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/ai-ops/secrets/${id}/primary`, { method: 'PUT' });
      await reload();
      setMessage('Primary key updated');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to set primary');
    } finally {
      setBusyId(null);
    }
  }

  async function loadAudit(id: string) {
    setAuditId(id);
    setAuditRows([]);
    try {
      const rows = await fetch(`/api/admin/ai-ops/secrets/${id}/audit`)
        .then((r) => r.json())
        .then((b) => (b.ok ? (b.data as AuditEntry[]) : []));
      setAuditRows(rows);
    } catch {
      setAuditRows([]);
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
              ? 'Encrypted provider credentials — create, test, rotate, and revoke keys'
              : canOperateSecrets
                ? 'View key metadata, test connectivity, disable keys, and read audit history'
                : 'API key inventory'
          }
          actions={
            canManageSecrets ? (
              <button
                type="button"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white"
                onClick={() => setShowCreate((v) => !v)}
              >
                Add key
              </button>
            ) : undefined
          }
        />
        {message ? <p className="text-sm text-gray-700">{message}</p> : null}

        {showCreate && canManageSecrets ? (
          <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-sm">
                Provider
                <select
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={form.providerKey}
                  onChange={(e) => setForm({ ...form, providerKey: e.target.value })}
                >
                  {PROVIDERS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Name
                <input
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="text-sm md:col-span-1">
                Secret
                <input
                  type="password"
                  className="mt-1 w-full rounded border px-2 py-1 font-mono text-xs"
                  value={form.secret}
                  onChange={(e) => setForm({ ...form, secret: e.target.value })}
                />
              </label>
            </div>
            <button
              type="button"
              disabled={busyId === 'create'}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              onClick={() => void createKey()}
            >
              Save key
            </button>
          </div>
        ) : null}

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <th className="px-4 py-2">Name</th>
              <th>Provider</th>
              <th>Hint</th>
              <th>Status</th>
              <th>Primary</th>
              <th>Last used</th>
              {canOperateSecrets || canManageSecrets ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((k) => (
              <tr key={k.id} className="border-b align-top">
                <td className="px-4 py-2 font-medium">{k.name}</td>
                <td className="font-mono text-xs">{k.providerKey}</td>
                <td className="font-mono text-xs">{k.secretHint ?? '****'}</td>
                <td>
                  {k.isPlaceholder ? (
                    <PlaceholderKeyBadge />
                  ) : (
                    <>
                      <EnabledBadge enabled={k.status === 'ACTIVE'} />
                      {k.status === 'PENDING_TEST' ? (
                        <span className="ml-1 text-xs text-amber-700">pending test</span>
                      ) : null}
                    </>
                  )}
                </td>
                <td>{k.isPrimary ? 'Yes' : '—'}</td>
                <td className="text-gray-500">
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : '—'}
                </td>
                {canOperateSecrets || canManageSecrets ? (
                  <td className="py-2 text-right">
                    <span className="inline-flex flex-wrap justify-end gap-2">
                      {canOperateSecrets ? (
                        <>
                          <button
                            type="button"
                            className="text-sm text-blue-600 disabled:opacity-50"
                            disabled={busyId === k.id || k.isPlaceholder}
                            title={
                              k.isPlaceholder
                                ? 'Replace this seed/demo key with a real provider secret before testing'
                                : undefined
                            }
                            onClick={() => void testKey(k.id)}
                          >
                            Test
                          </button>
                          <button
                            type="button"
                            className="text-sm text-gray-600"
                            onClick={() => void loadAudit(k.id)}
                          >
                            Audit
                          </button>
                        </>
                      ) : null}
                      {canManageSecrets && k.status === 'ACTIVE' && !k.isPrimary ? (
                        <button
                          type="button"
                          className="text-sm text-gray-600"
                          disabled={busyId === k.id}
                          onClick={() => void setPrimary(k.id)}
                        >
                          Set primary
                        </button>
                      ) : null}
                      {canManageSecrets && (k.isPlaceholder || k.status === 'ACTIVE') ? (
                        <button
                          type="button"
                          className="text-sm text-amber-700"
                          disabled={busyId === k.id}
                          onClick={() => {
                            setReplaceKeyId(k.id);
                            setBusyId(k.id);
                            setRotateSecret('');
                          }}
                        >
                          {k.isPlaceholder ? 'Replace key' : 'Rotate'}
                        </button>
                      ) : null}
                      {canManageSecrets && busyId === k.id && replaceKeyId === k.id ? (
                        <button
                          type="button"
                          className="text-sm text-blue-600 disabled:opacity-50"
                          disabled={!rotateSecret || rotateSecret.length < 20}
                          onClick={() => void rotateKey(k.id)}
                        >
                          Save replacement
                        </button>
                      ) : null}
                      {canOperateSecrets && k.status === 'ACTIVE' ? (
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
                    {canManageSecrets && busyId === k.id && replaceKeyId === k.id ? (
                      <input
                        type="password"
                        placeholder={
                          k.isPlaceholder
                            ? 'Paste real provider API key (min 20 characters)'
                            : 'New secret for rotate'
                        }
                        className="mt-2 w-full rounded border px-2 py-1 text-xs font-mono"
                        value={rotateSecret}
                        onChange={(e) => setRotateSecret(e.target.value)}
                      />
                    ) : null}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
        {(data ?? []).length === 0 ? (
          <p className="text-sm text-gray-500">No API keys configured.</p>
        ) : null}

        {auditId ? (
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium">Audit log</h3>
            <ul className="mt-2 space-y-1 text-xs text-gray-600">
              {auditRows.map((row) => (
                <li key={row.id}>
                  {new Date(row.createdAt).toLocaleString()} — {row.action}
                </li>
              ))}
              {auditRows.length === 0 ? <li>No audit entries</li> : null}
            </ul>
          </div>
        ) : null}
      </div>
    </AiOpsResourceBoundary>
  );
}
