'use client';

import { useCallback, useEffect, useState } from 'react';

import { AdminBadge } from '@/components/admin-ui/AdminBadge';
import { AdminEmptyState } from '@/components/admin-ui/AdminEmptyState';
import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { AdminStatCard } from '@/components/admin-ui/AdminStatCard';
import { AdminTable } from '@/components/admin-ui/AdminTable';
import { khInputClass, khLabelClass } from '@/components/admin/knowledge-hub/styles';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';
import { cn } from '@/lib/cn';
import type { AdminInventoryRow, PaginatedResult } from '@/types/feed-ecosystem';

import { FeedEcosystemPagination } from './FeedEcosystemPagination';

type InventoryResponse = PaginatedResult<AdminInventoryRow> & {
  summary: { totalRows: number; lowStockCount: number; totalQuantityKg: number };
};

export function InventoryMonitorList() {
  const [rows, setRows] = useState<AdminInventoryRow[]>([]);
  const [summary, setSummary] = useState<InventoryResponse['summary'] | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [appliedQ, setAppliedQ] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (appliedQ.trim()) qs.set('search', appliedQ.trim());
      if (lowStockOnly) qs.set('lowStockOnly', 'true');
      qs.set('page', String(page));
      qs.set('limit', '20');
      const data = await readAdminJson<InventoryResponse>(
        await adminFetch(`/api/admin/feed-inventory?${qs.toString()}`),
      );
      setRows(data.items);
      setSummary(data.summary);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, [appliedQ, lowStockOnly, page]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && rows.length === 0) return <AdminLoadingState message="ইনভেন্টরি লোড…" />;
  if (error && rows.length === 0) return <AdminErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="space-y-4">
      {summary ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminStatCard title="মোট স্টক লাইন" value={String(summary.totalRows)} />
          <AdminStatCard title="কম স্টক" value={String(summary.lowStockCount)} />
          <AdminStatCard title="মোট পরিমাণ (kg)" value={summary.totalQuantityKg.toFixed(1)} />
        </div>
      ) : null}

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
            <input type="checkbox" checked={lowStockOnly} onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1); }} />
            শুধু কম স্টক
          </label>
        </form>
      </AdminFormSection>

      {rows.length === 0 ? (
        <AdminEmptyState title="কোনো ইনভেন্টরি নেই" />
      ) : (
        <AdminTable>
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
            <tr>
              <th className="px-4 py-3">ফার্ম</th>
              <th className="px-4 py-3">নাম</th>
              <th className="px-4 py-3">পরিমাণ</th>
              <th className="px-4 py-3">সীমা</th>
              <th className="px-4 py-3">অবস্থা</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-mono text-xs">{row.farmRef}</td>
                <td className="px-4 py-3">
                  <div>{row.displayName}</div>
                  {row.feedItemNameBn ? <div className="text-xs text-zinc-500">{row.feedItemNameBn}</div> : null}
                </td>
                <td className="px-4 py-3 tabular-nums">{row.quantityOnHand} {row.unit}</td>
                <td className="px-4 py-3 tabular-nums">{row.lowStockThreshold ?? '—'}</td>
                <td className="px-4 py-3">
                  <AdminBadge variant={row.isLowStock ? 'warning' : 'success'}>
                    {row.isLowStock ? 'কম স্টক' : 'ঠিক আছে'}
                  </AdminBadge>
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
