import { cn } from "@/lib/cn";

function Block({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--pd-admin-radius,0.75rem)] bg-zinc-200/80 dark:bg-zinc-700/60",
        className,
      )}
    />
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-10" lang="bn" aria-busy aria-label="ড্যাশবোর্ড লোড হচ্ছে">
      <div className="space-y-2">
        <Block className="h-8 w-64" />
        <Block className="h-4 w-96 max-w-full" />
      </div>

      <section>
        <Block className="mb-4 h-4 w-24" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Block key={i} className="h-28" />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Block className="h-72" />
        <Block className="h-72" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Block className="h-56 lg:col-span-1" />
        <Block className="h-56 lg:col-span-2" />
      </section>

      <section>
        <Block className="mb-4 h-4 w-32" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Block key={i} className="h-20" />
          ))}
        </div>
      </section>

      <section>
        <Block className="mb-4 h-4 w-40" />
        <Block className="h-64" />
      </section>
    </div>
  );
}

export function AdminDashboardSectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <Block key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
