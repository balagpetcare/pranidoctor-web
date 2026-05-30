'use client';

import { useCallback, useEffect, useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';

type AiComplianceAdmin = {
  contentVersion: string;
  enabled: boolean;
  auditEnabled: boolean;
  emergencyDetectionEnabled: boolean;
  updatedAt: string | null;
};

export function AiComplianceAdminPanel() {
  const [data, setData] = useState<AiComplianceAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await readAdminJson<AiComplianceAdmin>(
        await adminFetch('/api/admin/settings/ai-compliance'),
      );
      setData(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave() {
    if (!data) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload = await readAdminJson<AiComplianceAdmin>(
        await adminFetch('/api/admin/settings/ai-compliance', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentVersion: data.contentVersion,
            enabled: data.enabled,
            auditEnabled: data.auditEnabled,
            emergencyDetectionEnabled: data.emergencyDetectionEnabled,
          }),
        }),
      );
      setData(payload);
      setMessage('Compliance rules saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoadingState message="Loading AI compliance rules…" />;
  if (error && !data) return <AdminErrorState message={error} onRetry={() => void load()} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <AdminFormSection title="AI compliance rules">
        <p className="mb-4 text-sm text-muted-foreground">
          Controls banner enforcement, emergency detection surfacing, and compliance audit logging.
          Disclaimer and emergency copy remain in their dedicated CMS panels.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.enabled}
            onChange={(e) => setData({ ...data, enabled: e.target.checked })}
          />
          Enable compliance banners and wrappers
        </label>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.emergencyDetectionEnabled}
            onChange={(e) =>
              setData({ ...data, emergencyDetectionEnabled: e.target.checked })
            }
          />
          Surface emergency detection (U1 / E2)
        </label>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.auditEnabled}
            onChange={(e) => setData({ ...data, auditEnabled: e.target.checked })}
          />
          Record compliance audit events
        </label>
        <label className="mt-4 block text-sm">
          Rules version
          <input
            className="mt-1 w-full rounded border px-2 py-1"
            value={data.contentVersion}
            onChange={(e) => setData({ ...data, contentVersion: e.target.value })}
          />
        </label>
      </AdminFormSection>

      <AdminActionButton variant="primary" disabled={saving} onClick={() => void onSave()}>
        {saving ? 'Saving…' : 'Save compliance rules'}
      </AdminActionButton>
    </div>
  );
}
