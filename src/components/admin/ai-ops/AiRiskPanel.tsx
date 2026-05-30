'use client';

import { useEffect, useState } from 'react';

import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';

type RiskRow = {
  farmRef: string;
  customerId: string;
  herdHealthScore: number;
  farmRiskScore: number;
  computedAt: string;
};

type RiskMonitoring = {
  highRiskFarms: RiskRow[];
  outbreaks: Array<{ diseaseSlug: string; riskIndex: number; effectiveDate: string }>;
};

export function AiRiskPanel() {
  const [data, setData] = useState<RiskMonitoring | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch('/api/admin/ai-ops/analytics/risk')
      .then((res) => readAdminJson<RiskMonitoring>(res))
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Farm risk monitoring" description="High-risk farms and outbreak signals" />
        <AdminLoadingState message="Loading risk data…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Farm risk monitoring" description="High-risk farms and outbreak signals" />
      <div>
        <p className="mb-2 font-medium">High-risk farms</p>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Farm</th>
              <th>Herd health</th>
              <th>Risk score</th>
              <th>Computed</th>
            </tr>
          </thead>
          <tbody>
            {data.highRiskFarms.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-3 text-gray-500">
                  No high-risk farms
                </td>
              </tr>
            ) : (
              data.highRiskFarms.map((r) => (
                <tr key={`${r.customerId}-${r.farmRef}-${r.computedAt}`} className="border-b">
                  <td className="py-2 font-mono text-xs">{r.farmRef}</td>
                  <td>{r.herdHealthScore}</td>
                  <td>{r.farmRiskScore}</td>
                  <td>{r.computedAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div>
        <p className="mb-2 font-medium">Regional outbreak signals</p>
        <ul className="divide-y rounded border bg-white">
          {data.outbreaks.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">No outbreak signals</li>
          ) : (
            data.outbreaks.map((o) => (
              <li key={`${o.diseaseSlug}-${o.effectiveDate}`} className="px-4 py-3 text-sm">
                {o.diseaseSlug} — risk {o.riskIndex} · {o.effectiveDate}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
