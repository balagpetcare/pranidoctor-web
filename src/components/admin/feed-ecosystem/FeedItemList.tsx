'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
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
import type { FeedItemDto, PaginatedResult } from '@/types/feed-ecosystem';

import { FeedEcosystemPagination } from './FeedEcosystemPagination';
import { FEED_CATEGORY_OPTIONS, categoryLabelBn } from './options';

export function FeedItemList() {
  const [rows, setRows] = useState<FeedItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [appliedQ, setAppliedQ] = useState('');
  const [category, setCategory] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (appliedQ.trim()) qs.set('search', appliedQ.trim());
      if (category) qs.set('category', category);
      if (activeFilter !== 'all') qs.set('isActive', activeFilter);
      qs.set('page', String(page));
      qs.set('limit', '20');
      const data = await readAdminJson<PaginatedResult<FeedItemDto>>(
        await adminFetch(`/api/admin/feed-items?${qs.toString()}`),
      );
      setRows(data.items);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'লোড করা যায়নি');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [appliedQ, category, activeFilter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setAppliedQ(q);
  }

  if (loading && rows.length === 0) return <AdminLoadingState message="খাদ্য আইটেম লোড হচ্ছে…" />;
  if (error && rows.length === 0) {
    return <AdminErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-4">
      <AdminFormSection title="ফিল্টার">
        <form onSubmit={onSearch} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className={cn('min-w-0 flex-1 sm:max-w-md', khLabelClass())}>
            অনুসন্ধান
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} className={khInputClass()} />
          </label>
          <label className={cn('sm:w-48', khLabelClass())}>
            বিভাগ
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className={khInputClass()}>
              <option value="">সব</option>
              {FEED_CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.labelBn}</option>
              ))}
            </select>
          </label>
          <label className={cn('sm:w-44', khLabelClass())}>
            সক্রিয়তা
            <select
              value={activeFilter}
              onChange={(e) => { setActiveFilter(e.target.value as typeof activeFilter); setPage(1); }}
              className={khInputClass()}
            >
              <option value="all">সব</option>
              <option value="true">সক্রিয়</option>
              <option value="false">নিষ্ক্রিয়</option>
            </select>
          </label>
          <AdminActionButton type="submit" variant="primary">খুঁজুন</AdminActionButton>
        </form>
      </AdminFormSection>

      {rows.length === 0 ? (
        <AdminEmptyState title="কোনো খাদ্য আইটেম নেই" />
      ) : (
        <AdminTable>
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
            <tr>
              <th className="px-4 py-3">কোড</th>
              <th className="px-4 py-3">নাম</th>
              <th className="px-4 py-3">বিভাগ</th>
              <th className="px-4 py-3">দাম (৳)</th>
              <th className="px-4 py-3">অবস্থা</th>
              <th className="px-4 py-3 text-right">কর্ম</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40">
                <td className="px-4 py-3 font-mono text-xs">{row.code}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{row.nameBn}</div>
                  <div className="text-xs text-zinc-500">{row.nameEn}</div>
                </td>
                <td className="px-4 py-3">{categoryLabelBn(row.category)}</td>
                <td className="px-4 py-3 tabular-nums">{row.approxPriceBdt ?? '—'}</td>
                <td className="px-4 py-3">
                  <AdminBadge variant={row.isActive ? 'success' : 'neutral'}>
                    {row.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </AdminBadge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/feed-ecosystem/items/${row.id}/edit`} className="text-sm font-medium text-emerald-700 hover:underline">
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
