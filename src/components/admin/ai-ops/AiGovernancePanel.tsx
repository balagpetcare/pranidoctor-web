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

export function AiGovernancePanel() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [llmDisabled, setLlmDisabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await readAdminJson<Escalation[]>(await adminFetch('/api/admin/ai-ops/governance'));
      setEscalations(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleKillSwitch(disable: boolean) {
    setBusy(true);
    setError(null);
    try {
      const data = await readAdminJson<{ llmDisabled: boolean }>(
        await adminFetch('/api/admin/ai-ops/governance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ disable }),
        }),
      );
      setLlmDisabled(data.llmDisabled);
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
        <p className="mb-4 text-sm text-gray-600">
          Status: {llmDisabled ? 'LLM disabled (rules-only fallback)' : 'LLM enabled'}
        </p>
        <AdminActionButton disabled={busy} onClick={() => void toggleKillSwitch(!llmDisabled)}>
          {llmDisabled ? 'Enable LLM' : 'Disable LLM'}
        </AdminActionButton>
      </div>
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
