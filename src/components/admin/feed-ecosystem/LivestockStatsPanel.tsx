'use client';

import { PawPrint } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { AdminStatCard } from '@/components/admin-ui/AdminStatCard';
import { AnalyticsBarChart, AnalyticsPieChart } from '@/components/admin/analytics/charts/AnalyticsCharts';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';
import type { PlatformLivestockStats } from '@/types/feed-ecosystem';

export function LivestockStatsPanel() {
  const [data, setData] = useState<PlatformLivestockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await readAdminJson<{ stats: PlatformLivestockStats }>(
        await adminFetch('/api/admin/livestock-statistics'),
      );
      setData(res.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !data) return <AdminLoadingState message="পশু পরিসংখ্যান লোড…" />;
  if (error && !data) return <AdminErrorState message={error} onRetry={() => void load()} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard title="মোট পশু" value={String(data.totals.all)} icon={PawPrint} />
        <AdminStatCard title="সক্রিয়" value={String(data.totals.active)} />
        <AdminStatCard title="স্বাস্থ্য রেকর্ড (৩০ দিন)" value={String(data.healthRecordsLast30Days)} />
        <AdminStatCard title="টিকা বাকি" value={String(data.vaccinationsPending)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminFormSection title="প্রজাতি অনুযায়ী">
          <AnalyticsPieChart
            slices={data.bySpecies.map((s) => ({ key: s.species, label: s.species, value: s.count }))}
          />
        </AdminFormSection>
        <AdminFormSection title="উদ্দেশ্য অনুযায়ী">
          <AnalyticsBarChart
            slices={data.byPurpose.map((p) => ({ key: p.purpose, label: p.purpose, value: p.count }))}
          />
        </AdminFormSection>
        <AdminFormSection title="স্বাস্থ্য অবস্থা" className="lg:col-span-2">
          <AnalyticsBarChart
            slices={data.byHealthStatus.map((h) => ({
              key: h.healthStatus,
              label: h.healthStatus,
              value: h.count,
            }))}
          />
        </AdminFormSection>
      </div>
    </div>
  );
}
