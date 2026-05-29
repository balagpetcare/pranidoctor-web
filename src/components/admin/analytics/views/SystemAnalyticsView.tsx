'use client';

import { Server } from 'lucide-react';

import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { fetchSystemAnalytics } from '@/lib/admin/analytics/api';
import { useAnalyticsQuery } from '@/lib/admin/analytics/use-analytics-query';

import { AnalyticsShell } from '../AnalyticsShell';
import { AnalyticsKpiGrid } from '../AnalyticsKpiGrid';
import { AnalyticsBarChart, AnalyticsPieChart } from '../charts/AnalyticsCharts';

export function SystemAnalyticsView() {
  const { data, loading, error, range, setRange, reload } = useAnalyticsQuery(
    fetchSystemAnalytics,
  );

  return (
    <AnalyticsShell
      title="System Analytics"
      description="Offline sync queue, sessions, and operational health."
      reportId="system"
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
              {
                title: 'Active sessions',
                value: String(data.activeSessions),
                icon: Server,
              },
            ]}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <AdminFormSection title="Offline sync queue">
              <AnalyticsBarChart
                slices={data.offlineQueue.map((q) => ({
                  key: q.status,
                  label: q.status,
                  value: q.count,
                }))}
              />
            </AdminFormSection>
            <AdminFormSection title="Users by role">
              <AnalyticsPieChart
                slices={data.usersByRole.map((r) => ({
                  key: r.role,
                  label: r.role,
                  value: r.count,
                }))}
              />
            </AdminFormSection>
          </div>
          <AdminFormSection title="API metrics">
            <p className="text-sm text-muted-foreground">{data.apiMetrics.message}</p>
          </AdminFormSection>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
