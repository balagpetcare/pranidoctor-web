'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminBadge } from '@/components/admin-ui/AdminBadge';
import { AdminEmptyState } from '@/components/admin-ui/AdminEmptyState';
import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { AdminStatCard } from '@/components/admin-ui/AdminStatCard';
import { AdminTable } from '@/components/admin-ui/AdminTable';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';
import type { ModerationQueueItem, PaginatedResult } from '@/types/feed-ecosystem';

import { FeedEcosystemPagination } from './FeedEcosystemPagination';
import { vendorStatusLabelBn } from './options';

type QueueResponse = PaginatedResult<ModerationQueueItem> & {
  pendingVendors: number;
  inactiveFeedItems: number;
};

export function ModerationQueuePanel() {
  const [rows, setRows] = useState<ModerationQueueItem[]>([]);
  const [pendingVendors, setPendingVendors] = useState(0);
  const [inactiveFeedItems, setInactiveFeedItems] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<'all' | 'vendor' | 'feed_item'>('all');
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), limit: '20', type });
      const data = await readAdminJson<QueueResponse>(
        await adminFetch(`/api/admin/feed-ecosystem/moderation?${qs.toString()}`),
      );
      setRows(data.items);
      setPendingVendors(data.pendingVendors);
      setInactiveFeedItems(data.inactiveFeedItems);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, [page, type]);

  useEffect(() => {
    void load();
  }, [load]);

  async function approveVendor(id: string) {
    setActingId(id);
    try {
      await readAdminJson(
        await adminFetch(`/api/admin/vendors/${id}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'VERIFIED' }),
        }),
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'অনুমোদন ব্যর্থ');
    } finally {
      setActingId(null);
    }
  }

  if (loading && rows.length === 0) return <AdminLoadingState message="মডারেশন কিউ লোড…" />;
  if (error && rows.length === 0) return <AdminErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminStatCard title="অপেক্ষমান ভেন্ডর" value={String(pendingVendors)} />
        <AdminStatCard title="নিষ্ক্রিয় খাদ্য" value={String(inactiveFeedItems)} />
      </div>

      <AdminFormSection title="ফিল্টার">
        <div className="flex flex-wrap gap-2">
          {(['all', 'vendor', 'feed_item'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setPage(1); }}
              className={`rounded-full px-3 py-1 text-sm ${type === t ? 'bg-emerald-100 text-emerald-900' : 'bg-zinc-100'}`}
            >
              {t === 'all' ? 'সব' : t === 'vendor' ? 'ভেন্ডর' : 'খাদ্য'}
            </button>
          ))}
        </div>
      </AdminFormSection>

      {rows.length === 0 ? (
        <AdminEmptyState title="কিউ খালি" description="অনুমোদনের জন্য কিছু নেই" />
      ) : (
        <AdminTable>
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
            <tr>
              <th className="px-4 py-3">ধরন</th>
              <th className="px-4 py-3">শিরোনাম</th>
              <th className="px-4 py-3">অবস্থা</th>
              <th className="px-4 py-3 text-right">কর্ম</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={`${row.type}-${row.id}`}>
                <td className="px-4 py-3">{row.type === 'vendor' ? 'ভেন্ডর' : 'খাদ্য'}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{row.titleBn ?? row.title}</div>
                  <div className="text-xs text-zinc-500">{row.title}</div>
                </td>
                <td className="px-4 py-3">
                  <AdminBadge variant="warning">
                    {row.type === 'vendor' ? vendorStatusLabelBn(row.status) : row.status}
                  </AdminBadge>
                </td>
                <td className="px-4 py-3 text-right">
                  {row.type === 'vendor' ? (
                    <AdminActionButton
                      type="button"
                      variant="primary"
                      disabled={actingId === row.id}
                      onClick={() => void approveVendor(row.id)}
                    >
                      অনুমোদন
                    </AdminActionButton>
                  ) : (
                    <Link href={`/admin/feed-ecosystem/items/${row.id}/edit`} className="text-sm text-emerald-700 hover:underline">
                      সক্রিয় করুন
                    </Link>
                  )}
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
