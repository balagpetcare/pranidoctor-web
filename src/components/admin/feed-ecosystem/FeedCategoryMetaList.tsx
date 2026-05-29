'use client';

import { useCallback, useEffect, useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { AdminTable } from '@/components/admin-ui/AdminTable';
import { khInputClass, khLabelClass } from '@/components/admin/knowledge-hub/styles';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';
import type { FeedCategoryMetaRow } from '@/types/feed-ecosystem';

export function FeedCategoryMetaList() {
  const [rows, setRows] = useState<FeedCategoryMetaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{ categories: FeedCategoryMetaRow[] }>(
        await adminFetch('/api/admin/feed-categories'),
      );
      setRows(data.categories);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function updateRow(value: string, field: keyof Omit<FeedCategoryMetaRow, 'value'>, text: string) {
    setRows((prev) => prev.map((r) => (r.value === value ? { ...r, [field]: text } : r)));
  }

  async function onSave() {
    setSaving(true);
    setMessage(null);
    setError(null);
    const patch = Object.fromEntries(
      rows.map((r) => [r.value, { labelBn: r.labelBn, labelEn: r.labelEn, descriptionBn: r.descriptionBn }]),
    );
    try {
      const data = await readAdminJson<{ categories: FeedCategoryMetaRow[] }>(
        await adminFetch('/api/admin/feed-categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        }),
      );
      setRows(data.categories);
      setMessage('সংরক্ষিত হয়েছে');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'সংরক্ষণ ব্যর্থ');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoadingState message="ক্যাটাগরি লোড হচ্ছে…" />;
  if (error && rows.length === 0) return <AdminErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="space-y-4">
      <AdminFormSection title="Enum ক্যাটাগরি মেটা" description="প্রতিটি FeedCategory enum-এর বাংলা/ইংরেজি লেবেল ও বর্ণনা।">
        <AdminTable>
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
            <tr>
              <th className="px-4 py-3">Enum</th>
              <th className="px-4 py-3">বাংলা</th>
              <th className="px-4 py-3">English</th>
              <th className="px-4 py-3">বর্ণনা (BN)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.value}>
                <td className="px-4 py-3 font-mono text-xs">{row.value}</td>
                <td className="px-4 py-3">
                  <input value={row.labelBn} onChange={(e) => updateRow(row.value, 'labelBn', e.target.value)} className={khInputClass()} />
                </td>
                <td className="px-4 py-3">
                  <input value={row.labelEn} onChange={(e) => updateRow(row.value, 'labelEn', e.target.value)} className={khInputClass()} />
                </td>
                <td className="px-4 py-3">
                  <input value={row.descriptionBn} onChange={(e) => updateRow(row.value, 'descriptionBn', e.target.value)} className={khInputClass()} />
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </AdminFormSection>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <AdminErrorState message={error} onRetry={onSave} /> : null}
      <AdminActionButton type="button" variant="primary" disabled={saving} onClick={() => void onSave()}>
        {saving ? 'সংরক্ষণ…' : 'সংরক্ষণ'}
      </AdminActionButton>
    </div>
  );
}
