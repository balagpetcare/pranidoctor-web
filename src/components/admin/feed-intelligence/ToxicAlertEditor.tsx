'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { khInputClass, khLabelClass } from '@/components/admin/knowledge-hub/styles';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';
import { cn } from '@/lib/cn';
import type { FeedAuditEvent, ToxicAlertDetail } from '@/types/feed-intelligence-admin';

type Props = { entityId?: string };

const emptyForm = {
  substance: '',
  titleBn: '',
  titleEn: '',
  bodyBn: '',
  bodyEn: '',
  commonNamesBn: '',
  species: 'CATTLE',
  toxicThreshold: '',
  lethalThreshold: '',
  clinicalSignsBn: '',
  immediateActionBn: '',
  immediateActionEn: '',
};

export function ToxicAlertEditor({ entityId }: Props) {
  const router = useRouter();
  const isEdit = Boolean(entityId);
  const [form, setForm] = useState(emptyForm);
  const [detail, setDetail] = useState<ToxicAlertDetail | null>(null);
  const [audit, setAudit] = useState<FeedAuditEvent[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const data = await readAdminJson<ToxicAlertDetail>(
        await adminFetch(`/api/admin/ai-ops/feed/toxic-alerts/${entityId}`),
      );
      setDetail(data);
      setForm({
        substance: data.substance,
        titleBn: data.titleBn,
        titleEn: data.titleEn,
        bodyBn: data.bodyBn,
        bodyEn: data.bodyEn,
        commonNamesBn: data.commonNamesBn.join(', '),
        species: data.speciesAffected[0] ?? 'CATTLE',
        toxicThreshold: data.toxicThreshold,
        lethalThreshold: data.lethalThreshold ?? '',
        clinicalSignsBn: data.clinicalSignsBn.join(', '),
        immediateActionBn: data.immediateActionBn,
        immediateActionEn: data.immediateActionEn,
      });
      const a = await readAdminJson<{ items: FeedAuditEvent[] }>(
        await adminFetch(`/api/admin/ai-ops/feed/toxic-alerts/${entityId}/audit`),
      );
      setAudit(a.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    void load();
  }, [load]);

  function buildPayload() {
    return {
      substance: form.substance,
      titleBn: form.titleBn,
      titleEn: form.titleEn,
      bodyBn: form.bodyBn,
      bodyEn: form.bodyEn,
      commonNamesBn: form.commonNamesBn.split(',').map((s) => s.trim()).filter(Boolean),
      speciesAffected: [form.species],
      species: [form.species],
      toxicThreshold: form.toxicThreshold,
      lethalThreshold: form.lethalThreshold || undefined,
      clinicalSignsBn: form.clinicalSignsBn.split(',').map((s) => s.trim()).filter(Boolean),
      immediateActionBn: form.immediateActionBn,
      immediateActionEn: form.immediateActionEn,
    };
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit && entityId) {
        await readAdminJson(
          await adminFetch(`/api/admin/ai-ops/feed/toxic-alerts/${entityId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildPayload()),
          }),
        );
        await load();
      } else {
        const created = await readAdminJson<{ entityId: string }>(
          await adminFetch('/api/admin/ai-ops/feed/toxic-alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildPayload()),
          }),
        );
        router.push(`/admin/ai-ops/feed-intelligence/toxic-alerts/${created.entityId}/edit`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'সংরক্ষণ ব্যর্থ');
    } finally {
      setSaving(false);
    }
  }

  async function action(path: string, body?: object) {
    if (!entityId) return;
    setSaving(true);
    try {
      await readAdminJson(
        await adminFetch(`/api/admin/ai-ops/feed/toxic-alerts/${entityId}/${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body ?? {}),
        }),
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'কর্ম ব্যর্থ');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoadingState message="লোড হচ্ছে…" />;
  if (error && !detail && isEdit) {
    return <AdminErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <AdminFormSection title="বিষাক্ত পদার্থ">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={khLabelClass()}>
            পদার্থ
            <input
              required
              value={form.substance}
              onChange={(e) => setForm({ ...form, substance: e.target.value })}
              className={khInputClass()}
            />
          </label>
          <label className={khLabelClass()}>
            প্রজাতি
            <select
              value={form.species}
              onChange={(e) => setForm({ ...form, species: e.target.value })}
              className={khInputClass()}
            >
              <option value="CATTLE">গরু</option>
              <option value="BUFFALO">মহিষ</option>
              <option value="GOAT">ছাগল</option>
              <option value="POULTRY">হাঁস-মুরগি</option>
            </select>
          </label>
          <label className={cn(khLabelClass(), 'sm:col-span-2')}>
            সাধারণ নাম (বাংলা, কমা-বিভক্ত)
            <input
              value={form.commonNamesBn}
              onChange={(e) => setForm({ ...form, commonNamesBn: e.target.value })}
              className={khInputClass()}
            />
          </label>
          <label className={khLabelClass()}>
            বিষাক্ত সীমা
            <input
              required
              value={form.toxicThreshold}
              onChange={(e) => setForm({ ...form, toxicThreshold: e.target.value })}
              className={khInputClass()}
            />
          </label>
          <label className={khLabelClass()}>
            মারাত্মক সীমা
            <input
              value={form.lethalThreshold}
              onChange={(e) => setForm({ ...form, lethalThreshold: e.target.value })}
              className={khInputClass()}
            />
          </label>
          <label className={cn(khLabelClass(), 'sm:col-span-2')}>
            লক্ষণ (বাংলা, কমা-বিভক্ত)
            <input
              required
              value={form.clinicalSignsBn}
              onChange={(e) => setForm({ ...form, clinicalSignsBn: e.target.value })}
              className={khInputClass()}
            />
          </label>
          <label className={khLabelClass()}>
            শিরোনাম (বাংলা)
            <input
              required
              value={form.titleBn}
              onChange={(e) => setForm({ ...form, titleBn: e.target.value })}
              className={khInputClass()}
            />
          </label>
          <label className={khLabelClass()}>
            শিরোনাম (ইংরেজি)
            <input
              required
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              className={khInputClass()}
            />
          </label>
        </div>
      </AdminFormSection>

      <AdminFormSection title="জরুরি পদক্ষেপ">
        <label className={cn(khLabelClass(), 'block')}>
          বাংলা
          <textarea
            required
            rows={3}
            value={form.immediateActionBn}
            onChange={(e) => setForm({ ...form, immediateActionBn: e.target.value })}
            className={khInputClass()}
          />
        </label>
        <label className={cn(khLabelClass(), 'mt-3 block')}>
          ইংরেজি
          <textarea
            required
            rows={3}
            value={form.immediateActionEn}
            onChange={(e) => setForm({ ...form, immediateActionEn: e.target.value })}
            className={khInputClass()}
          />
        </label>
        <label className={cn(khLabelClass(), 'mt-3 block')}>
          বিবরণ (বাংলা)
          <textarea
            required
            rows={3}
            value={form.bodyBn}
            onChange={(e) => setForm({ ...form, bodyBn: e.target.value })}
            className={khInputClass()}
          />
        </label>
        <label className={cn(khLabelClass(), 'mt-3 block')}>
          বিবরণ (ইংরেজি)
          <textarea
            required
            rows={3}
            value={form.bodyEn}
            onChange={(e) => setForm({ ...form, bodyEn: e.target.value })}
            className={khInputClass()}
          />
        </label>
      </AdminFormSection>

      <div className="flex flex-wrap gap-2">
        <AdminActionButton type="submit" variant="primary" disabled={saving}>
          সংরক্ষণ
        </AdminActionButton>
        {isEdit && detail?.status === 'DRAFT' ? (
          <AdminActionButton type="button" variant="secondary" onClick={() => void action('submit')}>
            জমা দিন
          </AdminActionButton>
        ) : null}
        {isEdit && detail?.status === 'IN_REVIEW' ? (
          <>
            <AdminActionButton
              type="button"
              variant="secondary"
              onClick={() => void action('review', { approved: true })}
            >
              পর্যালোচনা অনুমোদন
            </AdminActionButton>
            <AdminActionButton
              type="button"
              variant="secondary"
              onClick={() => void action('review', { approved: false, notes: 'Changes required' })}
            >
              পরিবর্তন চাই
            </AdminActionButton>
          </>
        ) : null}
        {isEdit && detail?.status === 'VET_APPROVAL' ? (
          <AdminActionButton type="button" variant="secondary" onClick={() => void action('approve')}>
            ভেট অনুমোদন
          </AdminActionButton>
        ) : null}
        {isEdit &&
        (detail?.status === 'IN_REVIEW' || detail?.status === 'VET_APPROVAL') ? (
          <AdminActionButton type="button" variant="primary" onClick={() => void action('publish')}>
            প্রকাশ
          </AdminActionButton>
        ) : null}
      </div>

      {isEdit && audit.length > 0 ? (
        <AdminFormSection title="অডিট লগ">
          <ul className="space-y-2 text-sm">
            {audit.map((ev) => (
              <li key={ev.id} className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-700">
                {ev.eventType} — {new Date(ev.createdAt).toLocaleString('bn-BD')}
              </li>
            ))}
          </ul>
        </AdminFormSection>
      ) : null}
    </form>
  );
}
