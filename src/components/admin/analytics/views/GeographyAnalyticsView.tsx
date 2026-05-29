'use client';

import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';

import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { fetchGeographyAnalytics } from '@/lib/admin/analytics/api';
import { useAnalyticsQuery } from '@/lib/admin/analytics/use-analytics-query';

import { AnalyticsShell } from '../AnalyticsShell';
import { AnalyticsBarChart } from '../charts/AnalyticsCharts';

export function GeographyAnalyticsView() {
  const [level, setLevel] = useState<'division' | 'district' | 'upazila'>('district');
  const extra = useMemo(() => ({ level }), [level]);
  const { data, loading, error, range, setRange, reload } = useAnalyticsQuery(
    (p) => fetchGeographyAnalytics({ ...p, level }),
    extra,
  );

  return (
    <AnalyticsShell
      title="Geographic Analytics"
      description="Service demand by division, district, or upazila."
      reportId="geography"
      from={range.from}
      to={range.to}
      onRangeChange={setRange}
      onRetry={reload}
      loading={loading}
      error={error}
      extraActions={
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as typeof level)}
          className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
        >
          <option value="division">Division</option>
          <option value="district">District</option>
          <option value="upazila">Upazila</option>
        </select>
      }
    >
      {data ? (
        <div className="space-y-6">
          <AdminFormSection
            title={`Top regions (${data.level})`}
            description={`${data.regions.length} areas with requests`}
          >
            <AnalyticsBarChart
              slices={data.regions.map((r) => ({
                key: r.areaId,
                label: r.name,
                value: r.requestCount,
              }))}
            />
          </AdminFormSection>
          <AdminFormSection
            title="Heat map data"
            description={`${data.heatmap.length} villages with coordinates`}
          >
            {data.heatmap.length === 0 ? (
              <p className="text-sm text-muted-foreground">No geocoded villages in range.</p>
            ) : (
              <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
                {data.heatmap.slice(0, 20).map((p) => (
                  <li key={p.villageId} className="flex justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {p.label}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {p.weight} requests
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </AdminFormSection>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
