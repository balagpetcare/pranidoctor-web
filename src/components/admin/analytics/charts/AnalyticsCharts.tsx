'use client';

import { cn } from '@/lib/cn';
import type { ChartSlice, TrendPoint } from '@/lib/admin/analytics/types';

const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#f43f5e', '#14b8a6'];

function formatTrendLabel(isoDate: string): string {
  const day = isoDate.slice(0, 10);
  if (day.length !== 10) return isoDate;
  return day;
}

function useChartGeometry(points: TrendPoint[], height = 160) {
  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const width = Math.max(points.length * 24, 280);
  const coords = points.map((p, i) => {
    const x = points.length <= 1 ? width / 2 : (i / (points.length - 1)) * width;
    const y = height - (p.value / max) * (height - 16);
    return { x, y };
  });
  const linePath =
    coords.length > 0
      ? coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
      : '';
  const areaPath =
    coords.length > 0
      ? `${linePath} L${coords[coords.length - 1]!.x},${height} L${coords[0]!.x},${height} Z`
      : '';
  return { width, height, coords, linePath, areaPath, max };
}

export function AnalyticsLineChart({
  points,
  className,
  emptyLabel = 'No trend data',
}: {
  points: TrendPoint[];
  className?: string;
  emptyLabel?: string;
}) {
  if (points.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  const { width, height, coords, linePath } = useChartGeometry(points);
  const first = formatTrendLabel(points[0]?.date ?? '');
  const last = formatTrendLabel(points[points.length - 1]?.date ?? '');
  return (
    <div className={cn('space-y-2', className)}>
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>{first}</span>
      <span>{last}</span>
    </div>
    <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full" role="img">
      <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="3" fill="#10b981" />
      ))}
    </svg>
    </div>
  );
}

export function AnalyticsAreaChart({
  points,
  className,
}: {
  points: TrendPoint[];
  className?: string;
}) {
  if (points.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No trend data</p>;
  }
  const { width, height, linePath, areaPath } = useChartGeometry(points);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn('h-40 w-full', className)} role="img">
      <path d={areaPath} fill="rgba(16, 185, 129, 0.2)" />
      <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" />
    </svg>
  );
}

export function AnalyticsTrendChart(props: { points: TrendPoint[]; className?: string }) {
  return <AnalyticsAreaChart {...props} />;
}

export function AnalyticsBarChart({
  slices,
  className,
}: {
  slices: ChartSlice[];
  className?: string;
}) {
  const max = Math.max(...slices.map((s) => s.value), 1);
  return (
    <ul className={cn('space-y-3', className)}>
      {slices.map((slice, i) => (
        <li key={slice.key}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{slice.label}</span>
            <span className="tabular-nums">{slice.value.toLocaleString('en-BD')}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(4, (slice.value / max) * 100)}%`,
                backgroundColor: COLORS[i % COLORS.length],
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AnalyticsPieChart({
  slices,
  className,
}: {
  slices: ChartSlice[];
  className?: string;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data</p>;
  }
  let cumulative = 0;
  const stops = slices.map((slice, i) => {
    const start = (cumulative / total) * 100;
    cumulative += slice.value;
    const end = (cumulative / total) * 100;
    return `${COLORS[i % COLORS.length]} ${start}% ${end}%`;
  });
  return (
    <div className={cn('flex flex-col items-center gap-4 sm:flex-row', className)}>
      <div
        className="h-32 w-32 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops.join(', ')})` }}
        role="img"
        aria-label="Distribution chart"
      />
      <ul className="min-w-0 flex-1 space-y-2 text-sm">
        {slices.map((slice, i) => (
          <li key={slice.key} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="flex-1 truncate">{slice.label}</span>
            <span className="tabular-nums">{slice.value.toLocaleString('en-BD')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AnalyticsDonutChart({
  slices,
  centerLabel,
  centerValue,
}: {
  slices: ChartSlice[];
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data</p>;
  }
  let cumulative = 0;
  const stops = slices.map((slice, i) => {
    const start = (cumulative / total) * 100;
    cumulative += slice.value;
    const end = (cumulative / total) * 100;
    return `${COLORS[i % COLORS.length]} ${start}% ${end}%`;
  });
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div
        className="relative h-36 w-36 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops.join(', ')})` }}
      >
        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-background text-center">
          {centerValue ? <span className="text-lg font-semibold tabular-nums">{centerValue}</span> : null}
          {centerLabel ? (
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {centerLabel}
            </span>
          ) : null}
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2 text-sm">
        {slices.map((slice, i) => (
          <li key={slice.key} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="flex-1 truncate">{slice.label}</span>
            <span className="tabular-nums">{slice.value.toLocaleString('en-BD')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
