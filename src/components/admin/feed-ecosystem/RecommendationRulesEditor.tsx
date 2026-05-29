'use client';

import { useCallback, useEffect, useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';

export function RecommendationRulesEditor() {
  const [jsonText, setJsonText] = useState('');
  const [version, setVersion] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{ version: string; source: string; rules: unknown }>(
        await adminFetch('/api/admin/recommendation-rules'),
      );
      setVersion(data.version);
      setSource(data.source);
      setJsonText(JSON.stringify(data.rules, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const rules = JSON.parse(jsonText) as unknown;
      const data = await readAdminJson<{ version: string; source: string }>(
        await adminFetch('/api/admin/recommendation-rules', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rules }),
        }),
      );
      setVersion(data.version);
      setSource(data.source);
      setMessage('নিয়ম সংরক্ষিত হয়েছে');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'সংরক্ষণ ব্যর্থ');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoadingState message="নিয়ম লোড…" />;
  if (error && !jsonText) return <AdminErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="space-y-4">
      <AdminFormSection
        title="সুপারিশ ইঞ্জিন নিয়ম"
        description={`সংস্করণ: ${version} · উৎস: ${source}`}
      >
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="min-h-[420px] w-full rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
          spellCheck={false}
        />
      </AdminFormSection>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <AdminErrorState message={error} onRetry={onSave} /> : null}
      <AdminActionButton type="button" variant="primary" disabled={saving} onClick={() => void onSave()}>
        {saving ? 'সংরক্ষণ…' : 'সংরক্ষণ'}
      </AdminActionButton>
    </div>
  );
}
