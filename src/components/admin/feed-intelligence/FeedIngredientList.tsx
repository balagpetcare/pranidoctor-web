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
import type {
  FeedAdminListResponse,
  FeedIngredientListItem,
} from '@/types/feed-intelligence-admin';

import { VERSION_STATUS_OPTIONS, statusLabelBn } from './options';

export function FeedIngredientList() {
  const [rows, setRows] = useState<FeedIngredientListItem[]>([]);
  const [total, setTotal] = useState(0);
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
      if (status) qs.set('status', status);
      qs.set('limit', '30');
      const data = await readAdminJson<FeedAdminListResponse<FeedIngredientListItem>>(
        await adminFetch(`/api/admin/ai-ops/feed/ingredients?${qs.toString()}`),
      );
      setRows(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'লোড করা যায়নি');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [appliedQ, status]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && rows.length === 0) {
    return <AdminLoadingState message="খাদ্য উপাদান লোড হচ্ছে…" />;
  }
  if (error && rows.length === 0) {
    return <AdminErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <div className="space-y-4">
      <AdminFormSection title="ফিল্টার">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedQ(q);
          }}
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <label className={cn('min-w-0 flex-1 sm:max-w-md', khLabelClass())}>
            অনুসন্ধান
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={khInputClass()}
            />
          </label>
          <label className={cn('sm:w-48', khLabelClass())}>
            স্ট্যাটাস
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={khInputClass()}
            >
              {VERSION_STATUS_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.labelBn}
                </option>
              ))}
            </select>
          </label>
          <AdminActionButton type="submit" variant="secondary">
            খুঁজুন
          </AdminActionButton>
        </form>
      </AdminFormSection>

      {rows.length === 0 ? (
        <AdminEmptyState
          title="কোনো উপাদান নেই"
          description="নতুন VKL খাদ্য উপাদান যোগ করুন।"
        />
      ) : (
        <AdminTable
          caption={`মোট ${total} উপাদান`}
          headers={['কোড', 'শিরোনাম', 'স্ট্যাটাস', 'উপলব্ধতা', '']}
          rows={rows.map((row) => [
            row.ingredientCode,
            <span key={row.entityId}>
              <span className="font-medium">{row.titleBn}</span>
              <span className="block text-xs text-zinc-500">{row.titleEn}</span>
            </span>,
            <AdminBadge key={`s-${row.entityId}`} tone={row.status === 'PUBLISHED' ? 'success' : 'neutral'}>
              {statusLabelBn(row.status)}
            </AdminBadge>,
            row.bdAvailability,
            <Link
              key={`l-${row.entityId}`}
              href={`/admin/ai-ops/feed-intelligence/ingredients/${row.entityId}/edit`}
              className="text-sm font-medium text-violet-700 hover:underline"
            >
              সম্পাদনা
            </Link>,
          ])}
        />
      )}
    </div>
  );
}
