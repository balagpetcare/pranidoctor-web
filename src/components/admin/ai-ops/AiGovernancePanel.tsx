'use client';

import { useCallback, useEffect, useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';

type Escalation = {
  id: string;
  reason: string;
  status: string;
  flaggedAt: string;
};

type GovernanceState = {
  llmDisabled: boolean;
  version: number;
  updatedAt: string;
  updatedByUserId: string | null;
  updatedByRole: string | null;
  reason: string | null;
  source: string;
};

type GovernanceHistory = {
  id: string;
  llmDisabled: boolean;
  previousLlmDisabled: boolean;
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

  useEffect(() => {
    void load();
  }, [load]);

  const llmDisabled = governance?.llmDisabled ?? false;

  async function toggleKillSwitch(disable: boolean) {
    setBusy(true);
    setError(null);
    try {
      const data = await readAdminJson<{ llmDisabled: boolean; governance: GovernanceState }>(
        await adminFetch('/api/admin/ai-ops/governance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            disable,
            reason: disable ? reason.trim() || undefined : undefined,
            expectedVersion: governance?.version,
          }),
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

  return (
    <div className="space-y-6">
      <AdminPageHeader title="AI Governance" subtitle="Escalations and LLM kill switch" />
      {error ? <p className="text-red-600">{error}</p> : null}
      <div className="rounded border bg-white p-4">
        <p className="mb-2 font-medium">LLM kill switch</p>
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
          {llmDisabled ? 'Enable LLM' : 'Disable LLM'}
        </AdminActionButton>
      </div>
      {history.length > 0 ? (
        <div>
          <p className="mb-2 font-medium">Kill switch history</p>
          <ul className="divide-y rounded border bg-white text-sm">
            {history.slice(0, 20).map((h) => (
              <li key={h.id} className="px-4 py-3">
                <span className="font-medium">
                  {h.previousLlmDisabled ? 'LLM off' : 'LLM on'} → {h.llmDisabled ? 'LLM off' : 'LLM on'}
                </span>
                {' · '}
                v{h.version} · {h.actorRole ?? 'system'} · {h.source}
                {h.reason ? ` — ${h.reason}` : ''}
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
