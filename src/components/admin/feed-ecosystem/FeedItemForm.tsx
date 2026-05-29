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
import type { FeedItemDto } from '@/types/feed-ecosystem';

import { FEED_CATEGORY_OPTIONS, FEED_MOISTURE_OPTIONS, FEED_UNIT_OPTIONS } from './options';

type Props = {
  mode: 'create' | 'edit';
  itemId?: string;
};

export function FeedItemForm({ mode, itemId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState('CONCENTRATE');
  const [defaultUnit, setDefaultUnit] = useState('KG');
  const [moistureType, setMoistureType] = useState('DRY');
  const [approxPriceBdt, setApproxPriceBdt] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [isSeasonal, setIsSeasonal] = useState(false);
  const [cpPercent, setCpPercent] = useState('');
  const [tdnPercent, setTdnPercent] = useState('');
  const [dmPercent, setDmPercent] = useState('');

  const load = useCallback(async () => {
    if (mode !== 'edit' || !itemId) return;
    setLoading(true);
    try {
      const data = await readAdminJson<{ item: FeedItemDto }>(
        await adminFetch(`/api/admin/feed-items/${itemId}`),
      );
      const row = data.item;
      setCode(row.code);
      setNameBn(row.nameBn);
      setNameEn(row.nameEn);
      setCategory(row.category);
      setDefaultUnit(row.defaultUnit);
      setMoistureType(row.moistureType);
      setApproxPriceBdt(row.approxPriceBdt != null ? String(row.approxPriceBdt) : '');
      setSortOrder(String(row.sortOrder));
      setIsActive(row.isActive);
      setIsSeasonal(row.isSeasonal);
      setCpPercent(row.nutrition?.cpPercent != null ? String(row.nutrition.cpPercent) : '');
      setTdnPercent(row.nutrition?.tdnPercent != null ? String(row.nutrition.tdnPercent) : '');
      setDmPercent(row.nutrition?.dmPercent != null ? String(row.nutrition.dmPercent) : '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, [mode, itemId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const nutrition = {
      cpPercent: cpPercent.trim() === '' ? null : Number(cpPercent),
      tdnPercent: tdnPercent.trim() === '' ? null : Number(tdnPercent),
      dmPercent: dmPercent.trim() === '' ? null : Number(dmPercent),
      source: 'admin-panel',
    };
    const body = {
      ...(mode === 'create' ? { code: code.trim().toLowerCase() } : {}),
      nameBn: nameBn.trim(),
      nameEn: nameEn.trim(),
      category,
      defaultUnit,
      moistureType,
      approxPriceBdt: approxPriceBdt.trim() === '' ? null : Number(approxPriceBdt),
      sortOrder: Number(sortOrder) || 0,
      isActive,
      isSeasonal,
      nutrition,
    };

    try {
      const res = await adminFetch(
        mode === 'create' ? '/api/admin/feed-items' : `/api/admin/feed-items/${itemId}`,
        {
          method: mode === 'create' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );
      await readAdminJson(res);
      router.push('/admin/feed-ecosystem/items');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'সংরক্ষণ ব্যর্থ');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoadingState message="ফর্ম লোড হচ্ছে…" />;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? <AdminErrorState message={error} onRetry={() => void load()} /> : null}

      <AdminFormSection title="মৌলিক তথ্য">
        <div className="grid gap-4 sm:grid-cols-2">
          {mode === 'create' ? (
            <label className={khLabelClass()}>
              কোড
              <input required value={code} onChange={(e) => setCode(e.target.value)} className={khInputClass()} />
            </label>
          ) : (
            <label className={khLabelClass()}>
              কোড
              <input value={code} readOnly className={cn(khInputClass(), 'opacity-70')} />
            </label>
          )}
          <label className={khLabelClass()}>
            সাজানোর ক্রম
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={khInputClass()} />
          </label>
          <label className={khLabelClass()}>
            নাম (বাংলা)
            <input required value={nameBn} onChange={(e) => setNameBn(e.target.value)} className={khInputClass()} />
          </label>
          <label className={khLabelClass()}>
            নাম (English)
            <input required value={nameEn} onChange={(e) => setNameEn(e.target.value)} className={khInputClass()} />
          </label>
          <label className={khLabelClass()}>
            বিভাগ
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={khInputClass()}>
              {FEED_CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.labelBn}</option>
              ))}
            </select>
          </label>
          <label className={khLabelClass()}>
            একক
            <select value={defaultUnit} onChange={(e) => setDefaultUnit(e.target.value)} className={khInputClass()}>
              {FEED_UNIT_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </label>
          <label className={khLabelClass()}>
            আর্দ্রতা
            <select value={moistureType} onChange={(e) => setMoistureType(e.target.value)} className={khInputClass()}>
              {FEED_MOISTURE_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>{m.labelBn}</option>
              ))}
            </select>
          </label>
          <label className={khLabelClass()}>
            আনুমানিক দাম (৳)
            <input type="number" min="0" value={approxPriceBdt} onChange={(e) => setApproxPriceBdt(e.target.value)} className={khInputClass()} />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            সক্রিয়
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isSeasonal} onChange={(e) => setIsSeasonal(e.target.checked)} />
            মৌসুমি
          </label>
        </div>
      </AdminFormSection>

      <AdminFormSection title="পুষ্টি (%)">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className={khLabelClass()}>
            CP
            <input type="number" min="0" max="100" step="0.1" value={cpPercent} onChange={(e) => setCpPercent(e.target.value)} className={khInputClass()} />
          </label>
          <label className={khLabelClass()}>
            TDN
            <input type="number" min="0" max="100" step="0.1" value={tdnPercent} onChange={(e) => setTdnPercent(e.target.value)} className={khInputClass()} />
          </label>
          <label className={khLabelClass()}>
            DM
            <input type="number" min="0" max="100" step="0.1" value={dmPercent} onChange={(e) => setDmPercent(e.target.value)} className={khInputClass()} />
          </label>
        </div>
      </AdminFormSection>

      <div className="flex flex-wrap gap-2">
        <AdminActionButton type="submit" variant="primary" disabled={saving}>
          {saving ? 'সংরক্ষণ…' : 'সংরক্ষণ'}
        </AdminActionButton>
        <AdminActionButton type="button" variant="secondary" onClick={() => router.back()}>
          বাতিল
        </AdminActionButton>
      </div>
    </form>
  );
}
