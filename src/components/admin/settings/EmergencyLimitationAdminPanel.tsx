'use client';

import { useCallback, useEffect, useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';

type LocaleField = { en: string; bn: string };

type EmergencyContextual = {
  instantCare: LocaleField;
  aiEmergency: LocaleField;
  bookingEmergency: LocaleField;
  discoveryEmergency: LocaleField;
  requestPending: LocaleField;
  bookingOnline: LocaleField;
  phoneDial: LocaleField;
};

type EmergencyLimitationAdmin = {
  contentVersion: string;
  enforceAcceptance: boolean;
  consentVersion: string;
  consentTitle: string;
  banner: LocaleField;
  urgent: LocaleField;
  full: LocaleField;
  contextual: EmergencyContextual;
  updatedAt: string | null;
};

const emptyLocale = (): LocaleField => ({ en: '', bn: '' });

const CONTEXT_LABELS: { key: keyof EmergencyContextual; title: string }[] = [
  { key: 'instantCare', title: 'U2 — Instant care sheet' },
  { key: 'aiEmergency', title: 'U2 — AI emergency result' },
  { key: 'bookingEmergency', title: 'U2 — Emergency doctor booking' },
  { key: 'discoveryEmergency', title: 'U2 — Discovery emergency filter' },
  { key: 'requestPending', title: 'U2 — Pending emergency request' },
  { key: 'bookingOnline', title: 'U2 — Online consultation' },
  { key: 'phoneDial', title: 'U2 — Before phone dial' },
];

export function EmergencyLimitationAdminPanel() {
  const [data, setData] = useState<EmergencyLimitationAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await readAdminJson<EmergencyLimitationAdmin>(
        await adminFetch('/api/admin/settings/emergency-limitation'),
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

  function patchContextual(key: keyof EmergencyContextual, locale: keyof LocaleField, value: string) {
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
      const payload = await readAdminJson<EmergencyLimitationAdmin>(
        await adminFetch('/api/admin/settings/emergency-limitation', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }),
      );
      setData(payload);
      setMessage('Emergency limitation settings saved. Bump consent version to re-prompt users.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoadingState message="Loading emergency limitation notice…" />;
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
        <label className="mt-3 block text-sm">
          Modal title
          <input
            className="mt-1 w-full rounded border px-2 py-1"
            value={data.consentTitle}
            onChange={(e) => setData({ ...data, consentTitle: e.target.value })}
          />
        </label>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.enforceAcceptance}
            onChange={(e) => setData({ ...data, enforceAcceptance: e.target.checked })}
          />
          Require acceptance before first emergency doctor booking
        </label>
      </AdminFormSection>

      <LocalePairEditor
        title="Platform banner"
        value={data.banner}
        onChange={(locale, value) =>
          setData({ ...data, banner: { ...data.banner, [locale]: value } })
        }
      />

      <LocalePairEditor
        title="U1 — Urgent interstitial"
        value={data.urgent}
        onChange={(locale, value) =>
          setData({ ...data, urgent: { ...data.urgent, [locale]: value } })
        }
      />

      <LocalePairEditor
        title="U3 — Full limitation (acceptance modal)"
        value={data.full}
        onChange={(locale, value) =>
          setData({ ...data, full: { ...data.full, [locale]: value } })
        }
      />

      {CONTEXT_LABELS.map(({ key, title }) => (
        <LocalePairEditor
          key={key}
          title={title}
          value={data.contextual[key]}
          onChange={(locale, value) => patchContextual(key, locale, value)}
        />
      ))}

      <AdminActionButton variant="primary" disabled={saving} onClick={() => void onSave()}>
        {saving ? 'Saving…' : 'Save emergency limitation notice'}
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
