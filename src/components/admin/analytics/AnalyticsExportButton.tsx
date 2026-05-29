'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { exportAnalyticsCsv } from '@/lib/admin/analytics/api';
import type { AnalyticsQueryParams } from '@/lib/admin/analytics/types';

type Props = {
  report: string;
  params: AnalyticsQueryParams;
  label?: string;
};

export function AnalyticsExportButton({ report, params, label = 'Export CSV' }: Props) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-stretch gap-1">
    <AdminActionButton
      type="button"
      variant="secondary"
      disabled={exporting}
      onClick={() => {
        setExporting(true);
        setExportError(null);
        void exportAnalyticsCsv(report, params)
          .catch((e) => {
            setExportError(e instanceof Error ? e.message : 'Export failed');
          })
          .finally(() => setExporting(false));
      }}
    >
      <Download className="me-2 h-4 w-4" aria-hidden />
      {exporting ? 'Exporting…' : label}
    </AdminActionButton>
    {exportError ? (
      <p className="text-xs text-red-600 dark:text-red-400" role="alert">
        {exportError}
      </p>
    ) : null}
    </div>
  );
}
