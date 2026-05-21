import { cn } from "@/lib/cn";

export type AdminChartSlice = {
  key: string;
  label: string;
  value: number;
  colorClass?: string;
};

const DEFAULT_COLORS = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-indigo-500",
];

export type AdminBarChartProps = {
  slices: AdminChartSlice[];
  className?: string;
  emptyLabel?: string;
};

export function AdminBarChart({
  slices,
  className,
  emptyLabel = "কোনো ডেটা নেই",
}: AdminBarChartProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--pd-admin-muted)]">{emptyLabel}</p>
    );
  }

  return (
    <ul className={cn("space-y-3", className)}>
      {slices.map((slice, i) => {
        const pct = Math.round((slice.value / total) * 100);
        const color = slice.colorClass ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
        return (
          <li key={slice.key}>
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className="truncate text-zinc-800 dark:text-zinc-200">{slice.label}</span>
              <span className="shrink-0 tabular-nums text-zinc-600 dark:text-zinc-400">
                {slice.value.toLocaleString("en-BD")}{" "}
                <span className="text-xs">({pct}%)</span>
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={cn("h-full rounded-full transition-all duration-500", color)}
                style={{ width: `${Math.max(pct, slice.value > 0 ? 4 : 0)}%` }}
                role="presentation"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export type AdminDonutChartProps = {
  slices: AdminChartSlice[];
  className?: string;
  centerLabel?: string;
  centerValue?: string;
};

export function AdminDonutChart({
  slices,
  className,
  centerLabel,
  centerValue,
}: AdminDonutChartProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--pd-admin-muted)]">কোনো ডেটা নেই</p>
    );
  }

  const gradientStops = slices
    .reduce<{ parts: string[]; cumulative: number }>(
      (acc, slice, i) => {
        const start = (acc.cumulative / total) * 100;
        const cumulative = acc.cumulative + slice.value;
        const end = (cumulative / total) * 100;
        const colorToken = [
          "#10b981",
          "#0ea5e9",
          "#f59e0b",
          "#8b5cf6",
          "#f43f5e",
          "#14b8a6",
        ][i % 6];
        acc.parts.push(`${colorToken} ${start}% ${end}%`);
        acc.cumulative = cumulative;
        return acc;
      },
      { parts: [], cumulative: 0 },
    )
    .parts.join(", ");

  return (
    <div className={cn("flex flex-col items-center gap-4 sm:flex-row sm:items-center", className)}>
      <div
        className="relative h-36 w-36 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(${gradientStops})`,
        }}
        role="img"
        aria-label={centerLabel ?? "চার্ট"}
      >
        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-[var(--pd-admin-surface)] text-center dark:bg-zinc-900">
          {centerValue ? (
            <span className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {centerValue}
            </span>
          ) : null}
          {centerLabel ? (
            <span className="text-[10px] uppercase tracking-wide text-zinc-500">{centerLabel}</span>
          ) : null}
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {slices.map((slice, i) => (
          <li key={slice.key} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: ["#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6", "#f43f5e", "#14b8a6"][
                  i % 6
                ],
              }}
              aria-hidden
            />
            <span className="truncate text-zinc-800 dark:text-zinc-200">{slice.label}</span>
            <span className="ms-auto tabular-nums text-zinc-600 dark:text-zinc-400">
              {slice.value.toLocaleString("en-BD")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
