'use client';

import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AiOpsResourceBoundary } from './AiOpsResourceBoundary';
import { useAiAdminResource } from './use-ai-admin-resource';

type ReadinessReport = {
  score: number;
  checkedAt: string;
  gates: Array<{
    id: string;
    label: string;
    status: 'pass' | 'warn' | 'fail';
    message: string;
  }>;
};

export function ReadinessDashboardPanel() {
  const { data, error, loading, reload } = useAiAdminResource<ReadinessReport>(
    '/api/admin/ai-ops/readiness?live=false',
  );

  return (
    <AiOpsResourceBoundary
      loading={loading && !data}
      error={error}
      reload={reload}
      loadingMessage="Checking AI readiness…"
      hasData={!!data}
    >
      <div className="space-y-6">
        <AdminPageHeader
          title="AI Readiness"
          description="Production readiness gates — Redis, vault, migrations, build, and provider health"
          actions={
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-sm"
              onClick={() => void reload()}
            >
              Re-check
            </button>
          }
        />

        {data ? (
          <>
            <div className="rounded-lg border bg-white p-6">
              <p className="text-xs uppercase text-gray-500">Readiness score</p>
              <p className="text-4xl font-bold">{data.score}/100</p>
              <p className="mt-1 text-xs text-gray-500">
                Last checked {new Date(data.checkedAt).toLocaleString()}
              </p>
            </div>

            <div className="space-y-3">
              {data.gates.map((gate) => (
                <div
                  key={gate.id}
                  className={`rounded-lg border px-4 py-3 ${
                    gate.status === 'pass'
                      ? 'border-green-200 bg-green-50'
                      : gate.status === 'warn'
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-sm">{gate.label}</p>
                    <span className="text-xs uppercase">{gate.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{gate.message}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </AiOpsResourceBoundary>
  );
}
