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
import type { PaginatedResult, VendorDto } from '@/types/feed-ecosystem';

import { FeedEcosystemPagination } from './FeedEcosystemPagination';
import { VENDOR_STATUS_OPTIONS, vendorStatusLabelBn } from './options';

export function VendorList() {
  const [rows, setRows] = useState<VendorDto[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [appliedQ, setAppliedQ] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (appliedQ.trim()) qs.set('search', appliedQ.trim());
      if (status) qs.set('verificationStatus', status);
      qs.set('page', String(page));
      qs.set('limit', '20');
      const data = await readAdminJson<PaginatedResult<VendorDto>>(
        await adminFetch(`/api/admin/vendors?${qs.toString()}`),
      );
      setRows(data.items);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, [appliedQ, status, page]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && rows.length === 0) return <AdminLoadingState message="ভেন্ডর লোড…" />;
  if (error && rows.length === 0) return <AdminErrorState message={error} onRetry={() => void load()} />;

  return (
    <div className="space-y-4">
      <AdminFormSection title="ফিল্টার">
        <form
          onSubmit={(e) => { e.preventDefault(); setPage(1); setAppliedQ(q); }}
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <label className={cn('flex-1 sm:max-w-md', khLabelClass())}>
            অনুসন্ধান
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} className={khInputClass()} />
          </label>
          <label className={cn('sm:w-48', khLabelClass())}>
            যাচাইকরণ
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={khInputClass()}>
              <option value="">সব</option>
              {VENDOR_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.labelBn}</option>
              ))}
            </select>
          </label>
          <AdminActionButton type="submit" variant="primary">খুঁজুন</AdminActionButton>
          <AdminActionButton href="/admin/feed-ecosystem/vendors/new" variant="secondary">নতুন ভেন্ডর</AdminActionButton>
        </form>
      </AdminFormSection>

      {rows.length === 0 ? (
        <AdminEmptyState title="কোনো ভেন্ডর নেই" />
      ) : (
        <AdminTable>
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
            <tr>
              <th className="px-4 py-3">নাম</th>
              <th className="px-4 py-3">ফোন</th>
              <th className="px-4 py-3">যাচাইকরণ</th>
              <th className="px-4 py-3">অবস্থা</th>
              <th className="px-4 py-3 text-right">কর্ম</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{row.nameBn ?? row.name}</div>
                  <div className="text-xs text-zinc-500">{row.name}</div>
                </td>
                <td className="px-4 py-3">{row.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <AdminBadge variant={row.verificationStatus === 'VERIFIED' ? 'success' : row.verificationStatus === 'PENDING' ? 'warning' : 'neutral'}>
                    {vendorStatusLabelBn(row.verificationStatus)}
                  </AdminBadge>
                </td>
                <td className="px-4 py-3">{row.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/feed-ecosystem/vendors/${row.id}`} className="text-sm text-emerald-700 hover:underline">
                    বিস্তারিত
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
