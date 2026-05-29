'use client';

import { Stethoscope } from 'lucide-react';

import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { fetchDoctorsAnalytics } from '@/lib/admin/analytics/api';
import { useAnalyticsQuery } from '@/lib/admin/analytics/use-analytics-query';

import { AnalyticsShell } from '../AnalyticsShell';
import { AnalyticsKpiGrid } from '../AnalyticsKpiGrid';
import { AnalyticsBarChart } from '../charts/AnalyticsCharts';

export function DoctorsAnalyticsView() {
  const { data, loading, error, range, setRange, reload } = useAnalyticsQuery(
    fetchDoctorsAnalytics,
  );

  return (
    <AnalyticsShell
      title="Doctor Analytics"
      description="Leaderboard, acceptance rate, and earnings."
      reportId="doctors"
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
              { title: 'Total doctors', value: String(data.summary.totalDoctors), icon: Stethoscope },
              { title: 'Verified', value: String(data.summary.verifiedDoctors) },
              { title: 'Pending', value: String(data.summary.pendingDoctors) },
              {
                title: 'Acceptance rate',
                value:
                  data.summary.acceptanceRate != null
                    ? `${(data.summary.acceptanceRate * 100).toFixed(1)}%`
                    : '—',
              },
              {
                title: 'Completion rate',
                value:
                  data.summary.completionRate != null
                    ? `${(data.summary.completionRate * 100).toFixed(1)}%`
                    : '—',
              },
            ]}
          />
          <AdminFormSection title="Top doctors by consultations">
            <AnalyticsBarChart
              slices={data.leaderboard.slice(0, 10).map((d) => ({
                key: d.doctorId,
                label: d.name,
                value: d.consultations,
              }))}
            />
          </AdminFormSection>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Consultations</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Response (min)</th>
                  <th className="px-4 py-3">Earnings (BDT)</th>
                </tr>
              </thead>
              <tbody>
                {data.leaderboard.map((row) => (
                  <tr key={row.doctorId} className="border-t">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 tabular-nums">{row.consultations}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.averageRating != null ? row.averageRating.toFixed(1) : '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.avgResponseMinutes != null
                        ? row.avgResponseMinutes.toFixed(0)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.earningsBdt.toLocaleString('en-BD')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
