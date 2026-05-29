'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { cn } from '@/lib/cn';

import { AnalyticsDateRangeSelector } from './AnalyticsDateRangeSelector';
import { AnalyticsExportButton } from './AnalyticsExportButton';

const NAV = [
  { href: '/admin/analytics', label: 'Overview' },
  { href: '/admin/analytics/revenue', label: 'Revenue' },
  { href: '/admin/analytics/doctors', label: 'Doctors' },
  { href: '/admin/analytics/farmers', label: 'Farmers' },
  { href: '/admin/analytics/livestock', label: 'Livestock' },
  { href: '/admin/analytics/geography', label: 'Geography' },
  { href: '/admin/analytics/system', label: 'System' },
] as const;

type Props = {
  title: string;
  description: string;
  reportId: string;
  from: string;
  to: string;
  onRangeChange: (range: { from: string; to: string }) => void;
  onRetry: () => void;
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
  extraActions?: React.ReactNode;
};

export function AnalyticsShell({
  title,
  description,
  reportId,
  from,
  to,
  onRangeChange,
  onRetry,
  loading,
  error,
  children,
  extraActions,
}: Props) {
  const pathname = usePathname();

  return (
    <div className="space-y-6" lang="bn">
      <AdminPageHeader title={title} description={description} />

      <nav
        className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1"
        aria-label="Analytics sections"
      >
        {NAV.map((item) => {
          const active =
            item.href === '/admin/analytics'
              ? pathname === '/admin/analytics'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <AnalyticsDateRangeSelector from={from} to={to} onChange={onRangeChange} />
        <div className="flex flex-wrap gap-2">
          <AdminActionButton variant="secondary" type="button" onClick={() => void onRetry()}>
            Refresh
          </AdminActionButton>
          <AnalyticsExportButton report={reportId} params={{ from, to }} />
          {extraActions}
        </div>
      </div>

      {loading ? <AdminLoadingState message="Loading analytics…" /> : null}
      {error ? <AdminErrorState message={error} onRetry={onRetry} /> : null}
      {!loading && !error ? children : null}
    </div>
  );
}
