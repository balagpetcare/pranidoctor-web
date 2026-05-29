'use client';

import { Leaf, Package, PawPrint, Store } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { AdminStatCard } from '@/components/admin-ui/AdminStatCard';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';

type OverviewData = {
  feedItems: number;
  vendors: number;
  lowStock: number;
  livestockActive: number;
};

export function FeedEcosystemOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [feedItems, vendors, analytics, livestock] = await Promise.all([
        readAdminJson<{ total: number }>(await adminFetch('/api/admin/feed-items?limit=1&page=1')),
        readAdminJson<{ total: number }>(await adminFetch('/api/admin/vendors?limit=1&page=1')),
        readAdminJson<{ analytics: { inventory: { lowStockCount: number } } }>(
          await adminFetch('/api/admin/feed-analytics?periodDays=30'),
        ),
        readAdminJson<{ stats: { totals: { active: number } } }>(
          await adminFetch('/api/admin/livestock-statistics'),
        ),
      ]);
      setData({
        feedItems: feedItems.total,
        vendors: vendors.total,
        lowStock: analytics.analytics.inventory.lowStockCount,
        livestockActive: livestock.stats.totals.active,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <AdminLoadingState message="সারাংশ লোড…" />;
  if (error) return <AdminErrorState message={error} onRetry={() => void load()} />;
  if (!data) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <AdminStatCard title="খাদ্য আইটেম" value={String(data.feedItems)} icon={Leaf} />
      <AdminStatCard title="ভেন্ডর" value={String(data.vendors)} icon={Store} />
      <AdminStatCard title="কম স্টক" value={String(data.lowStock)} icon={Package} />
      <AdminStatCard title="সক্রিয় পশু" value={String(data.livestockActive)} icon={PawPrint} />
    </div>
  );
}
