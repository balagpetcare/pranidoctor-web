'use client';

import { BarChart3, Package, ShoppingCart } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { AdminStatCard } from '@/components/admin-ui/AdminStatCard';
import { AnalyticsBarChart, AnalyticsLineChart } from '@/components/admin/analytics/charts/AnalyticsCharts';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';
import type { PlatformFeedAnalytics } from '@/types/feed-ecosystem';

import { categoryLabelBn } from './options';

export function FeedAnalyticsPanel() {
  const [data, setData] = useState<PlatformFeedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodDays, setPeriodDays] = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await readAdminJson<{ analytics: PlatformFeedAnalytics }>(
        await adminFetch(`/api/admin/feed-analytics?periodDays=${periodDays}`),
      );
      setData(res.analytics);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, [periodDays]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !data) return <AdminLoadingState message="অ্যানালিটিক্স লোড…" />;
  if (error && !data) return <AdminErrorState message={error} onRetry={() => void load()} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setPeriodDays(d)}
            className={`rounded-full px-3 py-1 text-sm ${periodDays === d ? 'bg-emerald-100 text-emerald-900' : 'bg-zinc-100 text-zinc-600'}`}
          >
            {d} দিন
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard title="সক্রিয় খাদ্য" value={String(data.feedItems.active)} icon={Package} />
        <AdminStatCard title="পুষ্টি সহ" value={String(data.feedItems.withNutrition)} icon={BarChart3} />
        <AdminStatCard title="ব্যবহার (৳)" value={data.consumption.totalCostBdt.toFixed(0)} icon={ShoppingCart} />
        <AdminStatCard title="সুপারিশ (৭ দিন)" value={String(data.recommendations.lastSevenDays)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminFormSection title="বিভাগ অনুযায়ী খাদ্য">
          <AnalyticsBarChart
            slices={data.feedItems.byCategory.map((c) => ({
              key: c.category,
              label: categoryLabelBn(c.category),
              value: c.count,
            }))}
          />
        </AdminFormSection>
        <AdminFormSection title="দৈনিক ব্যবহার খরচ">
          <AnalyticsLineChart
            points={data.consumption.byDay.map((d) => ({ date: d.date, value: d.costBdt }))}
            emptyLabel="এই সময়ে ব্যবহার ডেটা নেই"
          />
        </AdminFormSection>
      </div>
    </div>
  );
}
