'use client';

import {
  Activity,
  AlertTriangle,
  Stethoscope,
  Users,
  UserPlus,
} from 'lucide-react';

import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { fetchOverviewAnalytics } from '@/lib/admin/analytics/api';
import { useAnalyticsQuery } from '@/lib/admin/analytics/use-analytics-query';

import { AnalyticsShell } from '../AnalyticsShell';
import { AnalyticsKpiGrid } from '../AnalyticsKpiGrid';
import {
  AnalyticsAreaChart,
  AnalyticsBarChart,
  AnalyticsDonutChart,
  AnalyticsLineChart,
} from '../charts/AnalyticsCharts';

export function OverviewAnalyticsView() {
  const { data, loading, error, range, setRange, reload, params } = useAnalyticsQuery(
    fetchOverviewAnalytics,
  );

  return (
    <AnalyticsShell
      title="Analytics Overview"
      description="Platform KPIs, trends, and service pipeline summary."
      reportId="overview"
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
                title: 'Total users',
                value: String(data.kpis.totalUsers),
                icon: Users,
              },
              {
                title: 'Active users',
                value: String(data.kpis.activeUsers),
                description: 'Last 30 days',
                icon: Activity,
              },
              {
                title: 'New registrations',
                value: String(data.kpis.newRegistrations),
                icon: UserPlus,
                deltaPercent: data.comparison.newRegistrationsDeltaPercent,
              },
              {
                title: 'Farmers',
                value: String(data.kpis.totalFarmers),
                icon: Users,
              },
              {
                title: 'Doctors',
                value: String(data.kpis.totalDoctors),
                icon: Stethoscope,
              },
              {
                title: 'Verified doctors',
                value: String(data.kpis.verifiedDoctors),
              },
              {
                title: 'Pending doctors',
                value: String(data.kpis.pendingDoctors),
              },
              {
                title: 'Consultations',
                value: String(data.kpis.totalConsultations),
              },
              {
                title: 'Completed',
                value: String(data.kpis.completedConsultations),
                deltaPercent: data.comparison.completedConsultationsDeltaPercent,
              },
              {
                title: 'Cancelled',
                value: String(data.kpis.cancelledConsultations),
              },
              {
                title: 'Emergency calls',
                value: String(data.kpis.emergencyCalls),
                icon: AlertTriangle,
              },
              {
                title: 'Livestock cases',
                value: String(data.kpis.livestockCases),
              },
            ]}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <AdminFormSection title="Registrations trend" description="Daily new users">
              <AnalyticsLineChart points={data.trends.registrations} />
            </AdminFormSection>
            <AdminFormSection title="Consultations trend" description="Doctor consultations">
              <AnalyticsAreaChart points={data.trends.consultations} />
            </AdminFormSection>
            <AdminFormSection title="Requests by status">
              <AnalyticsBarChart slices={data.charts.serviceRequestsByStatus} />
            </AdminFormSection>
            <AdminFormSection title="Team composition">
              <AnalyticsDonutChart
                slices={data.charts.teamComposition}
                centerLabel="Total"
                centerValue={String(
                  data.charts.teamComposition.reduce((s, x) => s + x.value, 0),
                )}
              />
            </AdminFormSection>
          </div>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
