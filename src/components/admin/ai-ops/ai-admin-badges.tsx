'use client';

export function EnabledBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium ${
        enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {enabled ? 'Enabled' : 'Disabled'}
    </span>
  );
}

export function PlaceholderKeyBadge() {
  return (
    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
      Placeholder Key
    </span>
  );
}

export function CircuitBadge({ state }: { state?: string }) {
  const cls =
    state === 'open'
      ? 'bg-red-100 text-red-800'
      : state === 'half_open'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-green-100 text-green-800';
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {state ?? 'unknown'}
    </span>
  );
}
