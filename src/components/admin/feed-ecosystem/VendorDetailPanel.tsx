'use client';

import { useCallback, useEffect, useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminBadge } from '@/components/admin-ui/AdminBadge';
import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { AdminTable } from '@/components/admin-ui/AdminTable';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';
import type { VendorWithProductsDto } from '@/types/feed-ecosystem';

import { vendorStatusLabelBn } from './options';

type Props = { vendorId: string };

export function VendorDetailPanel({ vendorId }: Props) {
  const [vendor, setVendor] = useState<VendorWithProductsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{ vendor: VendorWithProductsDto }>(
        await adminFetch(`/api/admin/vendors/${vendorId}`),
      );
      setVendor(data.vendor);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function verify(status: 'VERIFIED' | 'REJECTED') {
    setActing(true);
    try {
      await readAdminJson(
        await adminFetch(`/api/admin/vendors/${vendorId}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }),
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'যাচাইকরণ ব্যর্থ');
    } finally {
      setActing(false);
    }
  }

  if (loading) return <AdminLoadingState message="ভেন্ডর লোড…" />;
  if (error && !vendor) return <AdminErrorState message={error} onRetry={() => void load()} />;
  if (!vendor) return <AdminErrorState message="ভেন্ডর পাওয়া যায়নি" />;

  return (
    <div className="space-y-6">
      <AdminFormSection title={vendor.nameBn ?? vendor.name}>
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <div><dt className="text-zinc-500">English</dt><dd>{vendor.name}</dd></div>
          <div><dt className="text-zinc-500">ফোন</dt><dd>{vendor.phone ?? '—'}</dd></div>
          <div><dt className="text-zinc-500">ঠিকানা</dt><dd>{vendor.address ?? '—'}</dd></div>
          <div>
            <dt className="text-zinc-500">যাচাইকরণ</dt>
            <dd>
              <AdminBadge variant={vendor.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}>
                {vendorStatusLabelBn(vendor.verificationStatus)}
              </AdminBadge>
            </dd>
          </div>
        </dl>
        {vendor.verificationStatus === 'PENDING' ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <AdminActionButton type="button" variant="primary" disabled={acting} onClick={() => void verify('VERIFIED')}>
              অনুমোদন
            </AdminActionButton>
            <AdminActionButton type="button" variant="secondary" disabled={acting} onClick={() => void verify('REJECTED')}>
              প্রত্যাখ্যান
            </AdminActionButton>
          </div>
        ) : null}
      </AdminFormSection>

      <AdminFormSection title="পণ্য তালিকা">
        {vendor.products.length === 0 ? (
          <p className="text-sm text-zinc-500">কোনো পণ্য নেই</p>
        ) : (
          <AdminTable>
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
              <tr>
                <th className="px-4 py-3">নাম</th>
                <th className="px-4 py-3">একক</th>
                <th className="px-4 py-3">দাম (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {vendor.products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">{p.displayName}</td>
                  <td className="px-4 py-3">{p.unit}</td>
                  <td className="px-4 py-3 tabular-nums">{p.priceBdt ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        )}
      </AdminFormSection>
    </div>
  );
}
