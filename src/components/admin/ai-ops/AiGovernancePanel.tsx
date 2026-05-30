'use client';

import { useCallback, useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';
import { useAdminPanelLoad } from '@/lib/admin/use-admin-panel-load';

type Escalation = {
  id: string;
  reason: string;
  status: string;
  flaggedAt: string;
};

type ScopeSnapshot = {
  features: Record<string, boolean>;
  providers: Record<string, boolean>;
};

type GovernanceState = {
  llmDisabled: boolean;
  version: number;
  updatedAt: string;
  updatedByUserId: string | null;
  updatedByRole: string | null;
  reason: string | null;
  source: string;
  environment: string;
  scopes: ScopeSnapshot;
};

type GovernanceHistory = {
  id: string;
  changeKind: string;
  llmDisabled: boolean;
  previousLlmDisabled: boolean;
  scopeType: string | null;
  scopeId: string | null;
  disabled: boolean | null;
  previousDisabled: boolean | null;
  version: number;
  actorId: string | null;
  actorRole: string | null;
  reason: string | null;
  source: string;
  createdAt: string;
};

type GovernancePanelResponse = {
  escalations: Escalation[];
  governance: GovernanceState;
  history: GovernanceHistory[];
};

function historyLabel(h: GovernanceHistory): string {
  if (h.changeKind === 'failed_attempt') {
    return `Failed attempt — ${h.reason ?? h.source}`;
  }
  if (h.changeKind === 'feature' || h.changeKind === 'provider') {
    return `${h.scopeType}/${h.scopeId}: ${h.previousDisabled ? 'off' : 'on'} → ${h.disabled ? 'off' : 'on'}`;
  }
  return `${h.previousLlmDisabled ? 'LLM off' : 'LLM on'} → ${h.llmDisabled ? 'LLM off' : 'LLM on'}`;
}

export function AiGovernancePanel() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [governance, setGovernance] = useState<GovernanceState | null>(null);
  const [history, setHistory] = useState<GovernanceHistory[]>([]);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await readAdminJson<GovernancePanelResponse>(
        await adminFetch('/api/admin/ai-ops/governance'),
      );
      setEscalations(data.escalations ?? []);
      setGovernance(data.governance);
      setHistory(data.history ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    }
  }, []);

  useAdminPanelLoad(load);

  const llmDisabled = governance?.llmDisabled ?? false;

  async function postGovernance(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const data = await readAdminJson<{ governance: GovernanceState }>(
        await adminFetch('/api/admin/ai-ops/governance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
      );
      setGovernance(data.governance);
      setReason('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  async function toggleKillSwitch(disable: boolean) {
    await postGovernance({
      disable,
      reason: disable ? reason.trim() || undefined : undefined,
      expectedVersion: governance?.version,
    });
  }

  async function toggleScope(
    scopeType: 'feature' | 'provider',
    scopeId: string,
    disabled: boolean,
  ) {
    await postGovernance({
      scopeUpdates: [{ scopeType, scopeId, disabled }],
      reason: disabled ? reason.trim() || undefined : undefined,
      expectedVersion: governance?.version,
    });
  }

  const scopes = governance?.scopes;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="AI Governance" description="Escalations and LLM kill switch" />
      {error ? <p className="text-red-600">{error}</p> : null}
      <div className="rounded border bg-white p-4">
        <p className="mb-2 font-medium">Global LLM kill switch</p>
        <p className="mb-2 text-sm text-gray-600">
          Status: {llmDisabled ? 'LLM disabled (rules-only fallback)' : 'LLM enabled'}
        </p>
        {governance ? (
          <dl className="mb-4 grid gap-1 text-xs text-gray-500 sm:grid-cols-2">
            <div>
              <dt className="inline font-medium">Version: </dt>
              <dd className="inline">{governance.version}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Environment: </dt>
              <dd className="inline">{governance.environment}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Updated: </dt>
              <dd className="inline">{new Date(governance.updatedAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="inline font-medium">By: </dt>
              <dd className="inline">
                {governance.updatedByRole ?? '—'}
                {governance.updatedByUserId ? ` (${governance.updatedByUserId})` : ''}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium">Source: </dt>
              <dd className="inline">{governance.source}</dd>
            </div>
            {governance.reason ? (
              <div className="sm:col-span-2">
                <dt className="inline font-medium">Last reason: </dt>
                <dd className="inline">{governance.reason}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        {!llmDisabled ? (
          <label className="mb-3 block text-sm">
            <span className="mb-1 block text-gray-700">Reason (required to disable in production)</span>
            <textarea
              className="w-full rounded border px-2 py-1 text-sm"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Provider outage — incident #123"
            />
          </label>
        ) : null}
        <AdminActionButton disabled={busy} onClick={() => void toggleKillSwitch(!llmDisabled)}>
          {llmDisabled ? 'Enable LLM (global)' : 'Disable LLM (global)'}
        </AdminActionButton>
      </div>

      {scopes ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded border bg-white p-4">
            <p className="mb-2 font-medium">Per-feature LLM disable</p>
            <ul className="space-y-2 text-sm">
              {Object.entries(scopes.features).map(([key, off]) => (
                <li key={key} className="flex items-center justify-between gap-2">
                  <span>
                    {key}: {off ? 'rules-only' : 'LLM allowed'}
                  </span>
                  <AdminActionButton
                    disabled={busy}
                    onClick={() => void toggleScope('feature', key, !off)}
                  >
                    {off ? 'Enable' : 'Disable'}
                  </AdminActionButton>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded border bg-white p-4">
            <p className="mb-2 font-medium">Per-provider disable</p>
            <ul className="space-y-2 text-sm">
              {Object.entries(scopes.providers).map(([key, off]) => (
                <li key={key} className="flex items-center justify-between gap-2">
                  <span>
                    {key}: {off ? 'blocked' : 'active'}
                  </span>
                  <AdminActionButton
                    disabled={busy}
                    onClick={() => void toggleScope('provider', key, !off)}
                  >
                    {off ? 'Enable' : 'Disable'}
                  </AdminActionButton>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {history.length > 0 ? (
        <div>
          <p className="mb-2 font-medium">Kill switch history</p>
          <ul className="divide-y rounded border bg-white text-sm">
            {history.slice(0, 20).map((h) => (
              <li key={h.id} className="px-4 py-3">
                <span className="font-medium">{historyLabel(h)}</span>
                {' · '}
                v{h.version} · {h.actorRole ?? 'system'} · {h.source}
                {h.reason && h.changeKind !== 'failed_attempt' ? ` — ${h.reason}` : ''}
                <br />
                <span className="text-xs text-gray-500">{new Date(h.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div>
        <p className="mb-2 font-medium">Recent escalations</p>
        <ul className="divide-y rounded border bg-white">
          {escalations.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">No escalations</li>
          ) : (
            escalations.map((e) => (
              <li key={e.id} className="px-4 py-3 text-sm">
                <span className="font-medium">{e.reason}</span> — {e.status} · {e.flaggedAt}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
