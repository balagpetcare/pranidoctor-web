'use client';

import { useCallback, useEffect, useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';

type LocaleField = { en: string; bn: string };

type TriggerKey =
  | 'emergency'
  | 'high'
  | 'lowConfidence'
  | 'policyRefusal'
  | 'supportVsVet'
  | 'humanReview'
  | 'escalationRecorded'
  | 'keywordLimitation';

type AiEscalationDisclosureAdmin = {
  contentVersion: string;
  banner: LocaleField;
  full: LocaleField;
  contextual: Record<TriggerKey, LocaleField>;
  updatedAt: string | null;
};

const TRIGGER_LABELS: Record<TriggerKey, string> = {
  emergency: 'E2 — Emergency (AI keyword)',
  high: 'E2 — HIGH urgency',
  lowConfidence: 'E2 — Low AI confidence',
  policyRefusal: 'E2 — Policy refusal',
  supportVsVet: 'E2 — Support vs veterinarian',
  humanReview: 'E2 — Human review availability',
  escalationRecorded: 'E2 — Escalation recorded',
  keywordLimitation: 'E2 — Keyword detection limitation',
};

const emptyLocale = (): LocaleField => ({ en: '', bn: '' });

const emptyContextual = (): Record<TriggerKey, LocaleField> => ({
  emergency: emptyLocale(),
  high: emptyLocale(),
  lowConfidence: emptyLocale(),
  policyRefusal: emptyLocale(),
  supportVsVet: emptyLocale(),
  humanReview: emptyLocale(),
  escalationRecorded: emptyLocale(),
  keywordLimitation: emptyLocale(),
});

export function AiEscalationDisclosureAdminPanel() {
  const [data, setData] = useState<AiEscalationDisclosureAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await readAdminJson<AiEscalationDisclosureAdmin>(
        await adminFetch('/api/admin/settings/ai-escalation-disclosure'),
      );
      setData({
        ...payload,
        contextual: { ...emptyContextual(), ...payload.contextual },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function patchContextual(key: TriggerKey, locale: keyof LocaleField, value: string) {
    setData((prev) => {
      if (!prev) return prev;
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
      const payload = await readAdminJson<AiEscalationDisclosureAdmin>(
        await adminFetch('/api/admin/settings/ai-escalation-disclosure', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      );
      setData(payload);
      setMessage(
        'Escalation disclosure saved. Bump content version so mobile caches refresh.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoadingState message="Loading escalation disclosure…" />;
  if (error && !data) return <AdminErrorState message={error} onRetry={() => void load()} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {message ? <p className="text-sm text-green-700 dark:text-green-400">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <AdminFormSection
        title="Versioning"
        description={`Content ${data.contentVersion} · Updated ${data.updatedAt ?? '—'}`}
      >
        <label className="text-sm">
          Content version (audit + cache bust)
          <input
            className="mt-1 w-full rounded border px-2 py-1"
            value={data.contentVersion}
            onChange={(e) => setData({ ...data, contentVersion: e.target.value })}
          />
        </label>
      </AdminFormSection>

      <LocalePairEditor
        title="E1 — Banner (AI escalation contexts)"
        value={data.banner}
        onChange={(locale, value) =>
          setData((prev) =>
            prev ? { ...prev, banner: { ...prev.banner, [locale]: value } } : prev,
          )
        }
      />

      <LocalePairEditor
        title="E3 — Full reference (settings / legal)"
        value={data.full}
        onChange={(locale, value) =>
          setData((prev) =>
            prev ? { ...prev, full: { ...prev.full, [locale]: value } } : prev,
          )
        }
      />

      {(Object.keys(TRIGGER_LABELS) as TriggerKey[]).map((key) => (
        <LocalePairEditor
          key={key}
          title={TRIGGER_LABELS[key]}
          value={data.contextual[key] ?? emptyLocale()}
          onChange={(locale, value) => patchContextual(key, locale, value)}
        />
      ))}

      <AdminActionButton variant="primary" disabled={saving} onClick={() => void onSave()}>
        {saving ? 'Saving…' : 'Save escalation disclosure'}
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
