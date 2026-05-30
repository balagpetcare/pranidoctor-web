'use client';

import { useState } from 'react';

import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AiOpsResourceBoundary } from './AiOpsResourceBoundary';
import { useAiAdminResource } from './use-ai-admin-resource';

type UsageReportRow = {
  timestamp: string;
  userId: string | null;
  feature: string;
  provider: string | null;
  model: string | null;
  totalTokens: number;
  costUsd: number;
  latencyMs: number | null;
  success: boolean;
  errorCode: string | null;
};

type UsageReport = {
  generatedAt: string;
  rows: UsageReportRow[];
  summary: { rowCount: number; totalTokens: number; costUsd: number };
};

type AuditEntry = {
  id: string;
  action: string;
  userId: string | null;
  createdAt: string;
  detailJson?: Record<string, unknown> | null;
};

export function AiLogsPanel() {
  const [tab, setTab] = useState<'usage' | 'audit'>('usage');

  const usage = useAiAdminResource<UsageReport>(
    '/api/admin/ai-ops/analytics/usage/report?sinceDays=7&limit=100',
    [tab],
  );
  const audit = useAiAdminResource<AuditEntry[]>(
    '/api/admin/ai-ops/audit?sinceDays=7',
    [tab],
  );

  const active = tab === 'usage' ? usage : audit;
  const loading = active.loading && !active.data;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Logs"
        description="Recent AI usage executions and governance audit events (7-day window)"
      />

      <div className="flex gap-2">
        <TabButton active={tab === 'usage'} onClick={() => setTab('usage')}>
          Usage logs
        </TabButton>
        <TabButton active={tab === 'audit'} onClick={() => setTab('audit')}>
          Audit log
        </TabButton>
      </div>

      {tab === 'usage' ? (
        <AiOpsResourceBoundary
          loading={loading}
          error={usage.error}
          reload={usage.reload}
          loadingMessage="Loading usage logs…"
          hasData={!!usage.data}
        >
          {usage.data ? (
            <>
              <p className="text-sm text-gray-600">
                {usage.data.summary.rowCount} rows ·{' '}
                {usage.data.summary.totalTokens.toLocaleString()} tokens · $
                {usage.data.summary.costUsd.toFixed(4)} est.
              </p>
              <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="min-w-full text-sm">
                  <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-2">Time</th>
                      <th>Feature</th>
                      <th>Provider / model</th>
                      <th>Tokens</th>
                      <th>Latency</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.data.rows.map((row, i) => (
                      <tr key={`${row.timestamp}-${i}`} className="border-b last:border-0">
                        <td className="whitespace-nowrap px-4 py-2 text-xs text-gray-600">
                          {new Date(row.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">{row.feature}</td>
                        <td className="px-4 py-2 font-mono text-xs">
                          {row.provider ?? '—'} / {row.model ?? '—'}
                        </td>
                        <td className="px-4 py-2">{row.totalTokens.toLocaleString()}</td>
                        <td className="px-4 py-2">
                          {row.latencyMs != null ? `${row.latencyMs} ms` : '—'}
                        </td>
                        <td className="px-4 py-2">
                          {row.success ? (
                            <span className="text-green-700">OK</span>
                          ) : (
                            <span className="text-red-600">{row.errorCode ?? 'Failed'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {usage.data.rows.length === 0 ? (
                <p className="text-sm text-gray-500">No usage logs in the selected window.</p>
              ) : null}
            </>
          ) : null}
        </AiOpsResourceBoundary>
      ) : (
        <AiOpsResourceBoundary
          loading={loading}
          error={audit.error}
          reload={audit.reload}
          loadingMessage="Loading audit log…"
          hasData={!!audit.data}
        >
          {audit.data ? (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="min-w-full text-sm">
                <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-2">Time</th>
                    <th>Action</th>
                    <th>Actor</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.data.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="whitespace-nowrap px-4 py-2 text-xs text-gray-600">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">{entry.action}</td>
                      <td className="px-4 py-2 font-mono text-xs">{entry.userId ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {audit.data.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">No audit events in the selected window.</p>
              ) : null}
            </div>
          ) : null}
        </AiOpsResourceBoundary>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
        active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}
