export function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-3xl space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This section will be implemented in a future milestone.
      </p>
    </div>
  );
}
