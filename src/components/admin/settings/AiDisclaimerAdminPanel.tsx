'use client';

import { useCallback, useEffect, useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';

type LocaleField = { en: string; bn: string };

type AiDisclaimerAdmin = {
  contentVersion: string;
  enforceAcceptance: boolean;
  consentVersion: string;
  consentTitle: string;
  consentContent: string;
  banner: LocaleField;
  contextual: {
    chat: LocaleField;
    recommendations: LocaleField;
    advisory: LocaleField;
  };
  updatedAt: string | null;
};

const emptyLocale = (): LocaleField => ({ en: '', bn: '' });

export function AiDisclaimerAdminPanel() {
  const [data, setData] = useState<AiDisclaimerAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await readAdminJson<AiDisclaimerAdmin>(
        await adminFetch('/api/admin/settings/ai-disclaimer'),
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

  function patchLocale(
    section: 'banner' | 'contextual',
    key: keyof AiDisclaimerAdmin['contextual'] | null,
    locale: keyof LocaleField,
    value: string,
  ) {
    setData((prev) => {
      if (!prev) return prev;
      if (section === 'banner') {
        return { ...prev, banner: { ...prev.banner, [locale]: value } };
      }
      if (!key) return prev;
      return {
        ...prev,
        contextual: {
          ...prev.contextual,
          [key]: { ...prev.contextual[key], [locale]: value },
        },
      };
    });
  }

  async function onSave() {
    if (!data) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload = await readAdminJson<AiDisclaimerAdmin>(
        await adminFetch('/api/admin/settings/ai-disclaimer', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      );
      setData(payload);
      setMessage('AI disclaimer settings saved. Bump consent version to re-prompt users.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoadingState message="Loading AI disclaimer…" />;
  if (error && !data) return <AdminErrorState message={error} onRetry={() => void load()} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {message ? <p className="text-sm text-green-700 dark:text-green-400">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <AdminFormSection
        title="Versioning & enforcement"
        description={`Content ${data.contentVersion} · Consent ${data.consentVersion} · Updated ${data.updatedAt ?? '—'}`}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Content version
            <input
              className="mt-1 w-full rounded border px-2 py-1"
              value={data.contentVersion}
              onChange={(e) => setData({ ...data, contentVersion: e.target.value })}
            />
          </label>
          <label className="text-sm">
            Consent version (re-prompt when changed)
            <input
              className="mt-1 w-full rounded border px-2 py-1"
              value={data.consentVersion}
              onChange={(e) => setData({ ...data, consentVersion: e.target.value })}
            />
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.enforceAcceptance}
            onChange={(e) => setData({ ...data, enforceAcceptance: e.target.checked })}
          />
          Require acceptance before AI routes
        </label>
      </AdminFormSection>

      <AdminFormSection title="T3 — Full consent (first-use modal)">
        <label className="text-sm">
          Title
          <input
            className="mt-1 w-full rounded border px-2 py-1"
            value={data.consentTitle}
            onChange={(e) => setData({ ...data, consentTitle: e.target.value })}
          />
        </label>
        <label className="mt-3 block text-sm">
          Content
          <textarea
            className="mt-1 min-h-[160px] w-full rounded border px-2 py-1"
            value={data.consentContent}
            onChange={(e) => setData({ ...data, consentContent: e.target.value })}
          />
        </label>
      </AdminFormSection>

      <LocalePairEditor
        title="T1 — Banner (all AI screens)"
        value={data.banner}
        onChange={(locale, value) => patchLocale('banner', null, locale, value)}
      />

      <LocalePairEditor
        title="T2 — Chat"
        value={data.contextual.chat}
        onChange={(locale, value) => patchLocale('contextual', 'chat', locale, value)}
      />
      <LocalePairEditor
        title="T2 — Recommendations"
        value={data.contextual.recommendations}
        onChange={(locale, value) => patchLocale('contextual', 'recommendations', locale, value)}
      />
      <LocalePairEditor
        title="T2 — Advisory (symptom, farm health, triage)"
        value={data.contextual.advisory}
        onChange={(locale, value) => patchLocale('contextual', 'advisory', locale, value)}
      />

      <AdminActionButton variant="primary" disabled={saving} onClick={() => void onSave()}>
        {saving ? 'Saving…' : 'Save disclaimer settings'}
      </AdminActionButton>
    </div>
  );
}

function LocalePairEditor({
  title,
  value,
  onChange,
}: {
  title: string;
  value: LocaleField;
  onChange: (locale: keyof LocaleField, value: string) => void;
}) {
  const safe = value ?? emptyLocale();
  return (
    <AdminFormSection title={title}>
      <label className="block text-sm">
        English
        <textarea
          className="mt-1 min-h-[72px] w-full rounded border px-2 py-1"
          value={safe.en}
          onChange={(e) => onChange('en', e.target.value)}
        />
      </label>
      <label className="mt-3 block text-sm">
        Bengali
        <textarea
          className="mt-1 min-h-[72px] w-full rounded border px-2 py-1"
          value={safe.bn}
          onChange={(e) => onChange('bn', e.target.value)}
        />
      </label>
    </AdminFormSection>
  );
}
