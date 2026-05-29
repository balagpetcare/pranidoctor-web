'use client';

import { PawPrint } from 'lucide-react';

import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { fetchLivestockAnalytics } from '@/lib/admin/analytics/api';
import { useAnalyticsQuery } from '@/lib/admin/analytics/use-analytics-query';

import { AnalyticsShell } from '../AnalyticsShell';
import { AnalyticsKpiGrid } from '../AnalyticsKpiGrid';
import { AnalyticsBarChart, AnalyticsPieChart } from '../charts/AnalyticsCharts';

const SPECIES_LABELS: Record<string, string> = {
  cow: 'Cow',
  goat: 'Goat',
  poultry: 'Poultry',
  pet: 'Pet',
  other: 'Other',
};

export function LivestockAnalyticsView() {
  const { data, loading, error, range, setRange, reload } = useAnalyticsQuery(
    fetchLivestockAnalytics,
  );

  const clinicalSlices = data
    ? Object.entries(data.clinical.casesBySpecies).map(([key, value]) => ({
        key,
        label: SPECIES_LABELS[key] ?? key,
        value,
      }))
    : [];

  return (
    <AnalyticsShell
      title="Livestock Analytics"
      description="Clinical cases by species and farm registry counts."
      reportId="livestock"
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
                title: 'Treatment cases',
                value: String(data.clinical.totalCases),
                icon: PawPrint,
              },
            ]}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <AdminFormSection title="Cases by species (clinical)">
              <AnalyticsPieChart slices={clinicalSlices} />
            </AdminFormSection>
            <AdminFormSection title="Top diseases / diagnoses">
              <AnalyticsBarChart
                slices={data.clinical.topDiseases.map((d) => ({
                  key: d.label,
                  label: d.label,
                  value: d.count,
                }))}
              />
            </AdminFormSection>
            <AdminFormSection title="Farm registry by species" className="lg:col-span-2">
              <AnalyticsBarChart
                slices={data.farmRegistry.bySpecies.map((s) => ({
                  key: s.species,
                  label: s.species,
                  value: s.count,
                }))}
              />
            </AdminFormSection>
          </div>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
