import type { LucideIcon } from 'lucide-react';

import { AdminStatCard } from '@/components/admin-ui/AdminStatCard';

export type KpiItem = {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  deltaPercent?: number | null;
};

export function AnalyticsKpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.title} className="relative">
          <AdminStatCard
            title={item.title}
            value={item.value}
            description={
              item.deltaPercent != null
                ? `${item.description ?? ''} (${item.deltaPercent >= 0 ? '+' : ''}${item.deltaPercent.toFixed(1)}%)`.trim()
                : item.description
            }
            icon={item.icon}
          />
        </div>
      ))}
    </div>
  );
}
