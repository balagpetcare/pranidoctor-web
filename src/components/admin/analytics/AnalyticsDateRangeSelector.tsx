'use client';

import { format, subDays } from 'date-fns';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';

type Props = {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
};

const PRESETS = [
  { label: '৭ দিন', days: 7 },
  { label: '৩০ দিন', days: 30 },
  { label: '৯০ দিন', days: 90 },
  { label: '১ বছর', days: 365 },
] as const;

export function AnalyticsDateRangeSelector({ from, to, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <AdminActionButton
            key={preset.days}
            variant="secondary"
            type="button"
            onClick={() => {
              const end = new Date();
              const start = subDays(end, preset.days - 1);
              onChange({
                from: format(start, 'yyyy-MM-dd'),
                to: format(end, 'yyyy-MM-dd'),
              });
            }}
          >
            {preset.label}
          </AdminActionButton>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => onChange({ from: e.target.value, to })}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => onChange({ from, to: e.target.value })}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          />
        </label>
      </div>
    </div>
  );
}
