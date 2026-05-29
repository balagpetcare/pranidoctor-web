'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AdminBadge } from '@/components/admin-ui/AdminBadge';
import { AdminEmptyState } from '@/components/admin-ui/AdminEmptyState';
import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { AdminTable } from '@/components/admin-ui/AdminTable';
import { khInputClass, khLabelClass } from '@/components/admin/knowledge-hub/styles';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';
import { cn } from '@/lib/cn';
import type { AdminNutritionRow, PaginatedResult } from '@/types/feed-ecosystem';

import { FeedEcosystemPagination } from './FeedEcosystemPagination';
import { categoryLabelBn } from './options';

export function FeedNutritionList() {
  const [rows, setRows] = useState<AdminNutritionRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [appliedQ, setAppliedQ] = useState('');
  const [missingOnly, setMissingOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (appliedQ.trim()) qs.set('search', appliedQ.trim());
      if (missingOnly) qs.set('missingOnly', 'true');
      qs.set('page', String(page));
      qs.set('limit', '20');
      const data = await readAdminJson<PaginatedResult<AdminNutritionRow>>(
        await adminFetch(`/api/admin/feed-nutrition?${qs.toString()}`),
      );
      setRows(data.items);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, [appliedQ, missingOnly, page]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && rows.length === 0) return <AdminLoadingState message="পুষ্টি তালিকা লোড…" />;
  if (error && rows.length === 0) return <AdminErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="space-y-4">
      <AdminFormSection title="ফিল্টার">
        <form
          onSubmit={(e) => { e.preventDefault(); setPage(1); setAppliedQ(q); }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className={cn('flex-1', khLabelClass())}>
            অনুসন্ধান
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} className={khInputClass()} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={missingOnly} onChange={(e) => { setMissingOnly(e.target.checked); setPage(1); }} />
            শুধু পুষ্টি ছাড়া
          </label>
        </form>
      </AdminFormSection>

      {rows.length === 0 ? (
        <AdminEmptyState title="কোনো আইটেম নেই" />
      ) : (
        <AdminTable>
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
            <tr>
              <th className="px-4 py-3">খাদ্য</th>
              <th className="px-4 py-3">বিভাগ</th>
              <th className="px-4 py-3">CP</th>
              <th className="px-4 py-3">TDN</th>
              <th className="px-4 py-3">DM</th>
              <th className="px-4 py-3">অবস্থা</th>
              <th className="px-4 py-3 text-right">কর্ম</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{row.nameBn}</div>
                  <div className="text-xs text-zinc-500">{row.code}</div>
                </td>
                <td className="px-4 py-3">{categoryLabelBn(row.category)}</td>
                <td className="px-4 py-3 tabular-nums">{row.cpPercent ?? '—'}</td>
                <td className="px-4 py-3 tabular-nums">{row.tdnPercent ?? '—'}</td>
                <td className="px-4 py-3 tabular-nums">{row.dmPercent ?? '—'}</td>
                <td className="px-4 py-3">
                  <AdminBadge variant={row.hasNutrition ? 'success' : 'warning'}>
                    {row.hasNutrition ? 'আছে' : 'নেই'}
                  </AdminBadge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/feed-ecosystem/items/${row.id}/edit`} className="text-sm text-emerald-700 hover:underline">
                    সম্পাদনা
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      <FeedEcosystemPagination page={page} hasMore={hasMore} total={total} limit={20} onPageChange={setPage} loading={loading} />
    </div>
  );
}
