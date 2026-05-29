'use client';

import { Users } from 'lucide-react';

import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { fetchFarmersAnalytics } from '@/lib/admin/analytics/api';
import { useAnalyticsQuery } from '@/lib/admin/analytics/use-analytics-query';

import { AnalyticsShell } from '../AnalyticsShell';
import { AnalyticsKpiGrid } from '../AnalyticsKpiGrid';
import { AnalyticsTrendChart } from '../charts/AnalyticsCharts';

export function FarmersAnalyticsView() {
  const { data, loading, error, range, setRange, reload } = useAnalyticsQuery(
    fetchFarmersAnalytics,
  );

  return (
    <AnalyticsShell
      title="Farmer Analytics"
      description="Acquisition, activity, and retention."
      reportId="farmers"
      from={range.from}
      to={range.to}
      onRangeChange={setRange}
      onRetry={reload}
      loading={loading}
      error={error}
    >
      {data ? (
        <div className="space-y-6">
          <AnalyticsKpiGrid
            items={[
              { title: 'Total farmers', value: String(data.summary.totalFarmers), icon: Users },
              { title: 'New farmers', value: String(data.summary.newFarmers) },
              { title: 'Active farmers', value: String(data.summary.activeFarmers) },
              {
                title: 'Avg consultations / farmer',
                value: data.summary.avgConsultationsPerActiveFarmer.toFixed(2),
              },
              {
                title: 'Retention rate',
                value:
                  data.summary.retentionRate != null
                    ? `${(data.summary.retentionRate * 100).toFixed(1)}%`
                    : '—',
              },
            ]}
          />
          <AdminFormSection title="New farmer registrations">
            <AnalyticsTrendChart points={data.trends.newFarmers} />
          </AdminFormSection>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
