'use client';

import { useMemo, useState } from 'react';
import { Wallet2 } from 'lucide-react';

import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { fetchRevenueAnalytics } from '@/lib/admin/analytics/api';
import { useAnalyticsQuery } from '@/lib/admin/analytics/use-analytics-query';

import { AnalyticsShell } from '../AnalyticsShell';
import { AnalyticsKpiGrid } from '../AnalyticsKpiGrid';
import {
  AnalyticsAreaChart,
  AnalyticsBarChart,
  AnalyticsLineChart,
} from '../charts/AnalyticsCharts';
import type { TrendPoint } from '@/lib/admin/analytics/types';

function formatBdt(n: number) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(n);
}

export function RevenueAnalyticsView() {
  const [grain, setGrain] = useState('day');
  const [basis, setBasis] = useState<'paid' | 'issued'>('paid');
  const extra = useMemo(() => ({ grain, basis }), [grain, basis]);
  const { data, loading, error, range, setRange, reload } = useAnalyticsQuery(
    (p) => fetchRevenueAnalytics({ ...p, grain, basis }),
    extra,
  );

  const revenueTrend: TrendPoint[] =
    data?.series.map((s) => ({ date: s.date, value: s.revenueBdt })) ?? [];

  return (
    <AnalyticsShell
      title="Revenue Analytics"
      description="Revenue, commission, and service-type breakdown."
      reportId="revenue"
      from={range.from}
      to={range.to}
      onRangeChange={setRange}
      onRetry={reload}
      loading={loading}
      error={error}
      extraActions={
        <>
          <AdminActionButton
            variant="secondary"
            type="button"
            onClick={() => setBasis(basis === 'paid' ? 'issued' : 'paid')}
          >
            Basis: {basis}
          </AdminActionButton>
          <select
            value={grain}
            onChange={(e) => setGrain(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </>
      }
    >
      {data ? (
        <div className="space-y-6">
          <AnalyticsKpiGrid
            items={[
              {
                title: 'Total revenue',
                value: formatBdt(data.summary.totalRevenueBdt),
                icon: Wallet2,
              },
              { title: 'Commission', value: formatBdt(data.summary.commissionBdt) },
              { title: 'Provider payout', value: formatBdt(data.summary.providerPayoutBdt) },
              {
                title: 'Consultation revenue',
                value: formatBdt(data.summary.consultationRevenueBdt),
              },
              { title: 'Emergency revenue', value: formatBdt(data.summary.emergencyRevenueBdt) },
            ]}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <AdminFormSection title="Revenue trend">
              <AnalyticsLineChart points={revenueTrend} />
            </AdminFormSection>
            <AdminFormSection title="Revenue area">
              <AnalyticsAreaChart points={revenueTrend} />
            </AdminFormSection>
            <AdminFormSection title="By service type" className="lg:col-span-2">
              <AnalyticsBarChart
                slices={data.byServiceType.map((r) => ({
                  key: r.serviceType,
                  label: r.serviceTypeLabel ?? r.serviceType,
                  value: r.revenueBdt,
                }))}
              />
            </AdminFormSection>
          </div>
        </div>
      ) : null}
    </AnalyticsShell>
  );
}
