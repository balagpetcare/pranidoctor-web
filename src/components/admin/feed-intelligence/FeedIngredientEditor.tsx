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
import type {
  FeedAuditEvent,
  FeedIngredientDetail,
  FeedVersionHistoryItem,
} from '@/types/feed-intelligence-admin';

type Props = {
  entityId?: string;
};

const emptyForm = {
  ingredientCode: '',
  titleBn: '',
  titleEn: '',
  bodyBn: '',
  bodyEn: '',
  localNamesBn: '',
  species: 'CATTLE',
  dmPercent: '85',
  cpPercent: '',
  bdAvailability: 'WIDELY_AVAILABLE',
};

export function FeedIngredientEditor({ entityId }: Props) {
  const router = useRouter();
  const isEdit = Boolean(entityId);
  const [form, setForm] = useState(emptyForm);
  const [detail, setDetail] = useState<FeedIngredientDetail | null>(null);
  const [versions, setVersions] = useState<FeedVersionHistoryItem[]>([]);
  const [audit, setAudit] = useState<FeedAuditEvent[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<FeedIngredientDetail>(
        await adminFetch(`/api/admin/ai-ops/feed/ingredients/${entityId}`),
      );
      setDetail(data);
      setForm({
        ingredientCode: data.ingredientCode,
        titleBn: data.titleBn,
        titleEn: data.titleEn,
        bodyBn: data.bodyBn,
        bodyEn: data.bodyEn,
        localNamesBn: data.localNamesBn.join(', '),
        species: data.species[0] ?? 'CATTLE',
        dmPercent: String(data.composition.dmPercent ?? ''),
        cpPercent: data.composition.cpPercent != null ? String(data.composition.cpPercent) : '',
        bdAvailability: data.bdAvailability,
      });
      const [v, a] = await Promise.all([
        readAdminJson<{ items: FeedVersionHistoryItem[] }>(
          await adminFetch(`/api/admin/ai-ops/feed/ingredients/${entityId}/versions`),
        ),
        readAdminJson<{ items: FeedAuditEvent[] }>(
          await adminFetch(`/api/admin/ai-ops/feed/ingredients/${entityId}/audit`),
        ),
      ]);
      setVersions(v.items);
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

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ingredientCode: form.ingredientCode,
      titleBn: form.titleBn,
      titleEn: form.titleEn,
      bodyBn: form.bodyBn,
      bodyEn: form.bodyEn,
      localNamesBn: form.localNamesBn.split(',').map((s) => s.trim()).filter(Boolean),
      species: [form.species],
      bdAvailability: form.bdAvailability,
      composition: {
        dmPercent: Number(form.dmPercent),
        ...(form.cpPercent ? { cpPercent: Number(form.cpPercent) } : {}),
      },
    };
    try {
      if (isEdit && entityId) {
        await readAdminJson(
          await adminFetch(`/api/admin/ai-ops/feed/ingredients/${entityId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }),
        );
        await load();
      } else {
        const created = await readAdminJson<{ entityId: string }>(
          await adminFetch('/api/admin/ai-ops/feed/ingredients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }),
        );
        router.push(`/admin/ai-ops/feed-intelligence/ingredients/${created.entityId}/edit`);
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
    setError(null);
    try {
      await readAdminJson(
        await adminFetch(`/api/admin/ai-ops/feed/ingredients/${entityId}/${path}`, {
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

      <AdminFormSection title="মৌলিক তথ্য">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={khLabelClass()}>
            উপাদান কোড
            <input
              required
              disabled={isEdit}
              value={form.ingredientCode}
              onChange={(e) => setForm({ ...form, ingredientCode: e.target.value })}
              className={khInputClass()}
            />
          </label>
          <label className={khLabelClass()}>
            BD উপলব্ধতা
            <select
              value={form.bdAvailability}
              onChange={(e) => setForm({ ...form, bdAvailability: e.target.value })}
              className={khInputClass()}
            >
              <option value="WIDELY_AVAILABLE">ব্যাপকভাবে উপলব্ধ</option>
              <option value="SEASONAL">মৌসুমি</option>
              <option value="REGIONAL">আঞ্চলিক</option>
              <option value="SCARCE">সীমিত</option>
            </select>
          </label>
          <label className={cn(khLabelClass(), 'sm:col-span-2')}>
            বাংলা নাম (কমা-বিভক্ত)
            <input
              value={form.localNamesBn}
              onChange={(e) => setForm({ ...form, localNamesBn: e.target.value })}
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
              <option value="SHEEP">ভেড়া</option>
              <option value="POULTRY">হাঁস-মুরগি</option>
            </select>
          </label>
          <label className={khLabelClass()}>
            DM %
            <input
              required
              type="number"
              step="0.01"
              value={form.dmPercent}
              onChange={(e) => setForm({ ...form, dmPercent: e.target.value })}
              className={khInputClass()}
            />
          </label>
          <label className={khLabelClass()}>
            CP %
            <input
              type="number"
              step="0.01"
              value={form.cpPercent}
              onChange={(e) => setForm({ ...form, cpPercent: e.target.value })}
              className={khInputClass()}
            />
          </label>
        </div>
      </AdminFormSection>

      <AdminFormSection title="বিষয়বস্তু">
        <label className={cn(khLabelClass(), 'block')}>
          বাংলা বিবরণ
          <textarea
            required
            rows={4}
            value={form.bodyBn}
            onChange={(e) => setForm({ ...form, bodyBn: e.target.value })}
            className={khInputClass()}
          />
        </label>
        <label className={cn(khLabelClass(), 'mt-3 block')}>
          ইংরেজি বিবরণ
          <textarea
            required
            rows={4}
            value={form.bodyEn}
            onChange={(e) => setForm({ ...form, bodyEn: e.target.value })}
            className={khInputClass()}
          />
        </label>
      </AdminFormSection>

      <div className="flex flex-wrap gap-2">
        <AdminActionButton type="submit" variant="primary" disabled={saving}>
          {saving ? 'সংরক্ষণ…' : 'সংরক্ষণ'}
        </AdminActionButton>
        {isEdit && detail?.status === 'DRAFT' ? (
          <AdminActionButton type="button" variant="secondary" onClick={() => void action('submit')}>
            পর্যালোচনায় পাঠান
          </AdminActionButton>
        ) : null}
        {isEdit && (detail?.status === 'IN_REVIEW' || detail?.status === 'VET_APPROVAL') ? (
          <AdminActionButton type="button" variant="secondary" onClick={() => void action('publish')}>
            প্রকাশ
          </AdminActionButton>
        ) : null}
        {isEdit && detail?.status === 'PUBLISHED' ? (
          <AdminActionButton
            type="button"
            variant="secondary"
            onClick={() => void action('archive', { reason: 'Admin archive' })}
          >
            আর্কাইভ
          </AdminActionButton>
        ) : null}
        {isEdit && detail?.status === 'DEPRECATED' ? (
          <AdminActionButton type="button" variant="secondary" onClick={() => void action('restore')}>
            পুনরুদ্ধার
          </AdminActionButton>
        ) : null}
      </div>

      {isEdit && versions.length > 0 ? (
        <AdminFormSection title="সংস্করণ ইতিহাস">
          <ul className="space-y-2 text-sm">
            {versions.map((v) => (
              <li key={v.versionId} className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-700">
                v{v.versionNumber} — {v.status} — {v.titleBn}
              </li>
            ))}
          </ul>
        </AdminFormSection>
      ) : null}

      {isEdit && audit.length > 0 ? (
        <AdminFormSection title="অডিট লগ">
          <ul className="space-y-2 text-sm">
            {audit.map((ev) => (
              <li key={ev.id} className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-700">
                <span className="font-medium">{ev.eventType}</span>
                <span className="text-zinc-500"> — {new Date(ev.createdAt).toLocaleString('bn-BD')}</span>
              </li>
            ))}
          </ul>
        </AdminFormSection>
      ) : null}
    </form>
  );
}
