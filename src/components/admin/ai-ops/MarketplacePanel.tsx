'use client';

import { useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { AiOpsResourceBoundary } from './AiOpsResourceBoundary';
import { EnabledBadge } from './ai-admin-badges';
import { aiAdminPost, useAiAdminResource } from './use-ai-admin-resource';

type Extension = {
  id: string;
  extensionKey: string;
  name: string;
  version: string;
  publisher: string | null;
  adapterType: string;
  providerKey: string | null;
  status: string;
  enabled: boolean;
  modelCount: number;
  installedAt: string | null;
};

type ExternalModel = {
  id: string;
  providerKey: string;
  modelKey: string;
  displayName: string;
  enabled: boolean;
  source: string;
};

type VeterinaryModel = {
  id: string;
  modelKey: string;
  displayName: string;
  modelCategory: string | null;
  enabled: boolean;
};

type AdaptersResponse = { adapterTypes: string[] };

export function MarketplacePanel() {
  const extensions = useAiAdminResource<Extension[]>('/api/admin/ai-ops/marketplace/extensions');
  const external = useAiAdminResource<ExternalModel[]>(
    '/api/admin/ai-ops/marketplace/models/external',
  );
  const veterinary = useAiAdminResource<VeterinaryModel[]>(
    '/api/admin/ai-ops/marketplace/veterinary/models',
  );
  const adapters = useAiAdminResource<AdaptersResponse>(
    '/api/admin/ai-ops/marketplace/adapters',
  );

  const [openRouterIds, setOpenRouterIds] = useState('');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);

  const loading =
    extensions.loading && !extensions.data && external.loading && !external.data;
  const error = extensions.error ?? external.error ?? veterinary.error ?? adapters.error;

  async function syncOpenRouter() {
    const modelIds = openRouterIds
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (modelIds.length === 0) {
      setSyncMessage('Enter at least one OpenRouter model ID.');
      return;
    }
    setSyncBusy(true);
    setSyncMessage(null);
    try {
      const result = await aiAdminPost<{ registered?: number; skipped?: number }>(
        '/api/admin/ai-ops/marketplace/openrouter/sync',
        { modelIds },
      );
      setSyncMessage(
        `Registered ${result.registered ?? 0}, skipped ${result.skipped ?? 0}.`,
      );
      await external.reload();
    } catch (e) {
      setSyncMessage(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncBusy(false);
    }
  }

  function reloadAll() {
    void extensions.reload();
    void external.reload();
    void veterinary.reload();
    void adapters.reload();
  }

  return (
    <AiOpsResourceBoundary
      loading={loading}
      error={error}
      reload={reloadAll}
      loadingMessage="Loading marketplace…"
      hasData={!!extensions.data || !!external.data}
    >
      <div className="space-y-8">
        <AdminPageHeader
          title="Marketplace"
          description="Extensions, external models, veterinary models, and OpenRouter catalog sync"
        />

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-800">Registered extensions</h2>
          <DataTable
            headers={['Name', 'Key', 'Adapter', 'Models', 'Status', 'Enabled']}
            rows={(extensions.data ?? []).map((ext) => [
              ext.name,
              ext.extensionKey,
              ext.adapterType,
              String(ext.modelCount),
              ext.status,
              ext.enabled ? 'Yes' : 'No',
            ])}
            empty="No marketplace extensions installed."
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-800">External models</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <th className="px-4 py-2">Display name</th>
                <th>Provider</th>
                <th>Model key</th>
                <th>Source</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(external.data ?? []).map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="px-4 py-2 font-medium">{m.displayName}</td>
                  <td className="font-mono text-xs">{m.providerKey}</td>
                  <td className="font-mono text-xs">{m.modelKey}</td>
                  <td>{m.source}</td>
                  <td>
                    <EnabledBadge enabled={m.enabled} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(external.data ?? []).length === 0 ? (
            <p className="text-sm text-gray-500">No external models registered.</p>
          ) : null}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-800">Veterinary models</h2>
          <DataTable
            headers={['Display name', 'Model key', 'Category', 'Enabled']}
            rows={(veterinary.data ?? []).map((m) => [
              m.displayName,
              m.modelKey,
              m.modelCategory ?? '—',
              m.enabled ? 'Yes' : 'No',
            ])}
            empty="No veterinary models configured."
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-800">Adapter types</h2>
          <p className="text-sm text-gray-600">
            {(adapters.data?.adapterTypes ?? []).join(', ') || 'No adapters registered.'}
          </p>
        </section>

        <section className="space-y-3 rounded-lg border bg-white p-4">
          <h2 className="text-sm font-medium text-gray-800">OpenRouter sync</h2>
          <p className="text-sm text-gray-600">
            Enter OpenRouter model IDs (one per line or comma-separated) to import into the
            marketplace.
          </p>
          <textarea
            className="w-full rounded border px-3 py-2 font-mono text-sm"
            rows={4}
            value={openRouterIds}
            onChange={(e) => setOpenRouterIds(e.target.value)}
            placeholder="openai/gpt-4o-mini"
          />
          {syncMessage ? <p className="text-sm text-gray-700">{syncMessage}</p> : null}
          <AdminActionButton
            type="button"
            variant="primary"
            disabled={syncBusy}
            onClick={() => void syncOpenRouter()}
          >
            {syncBusy ? 'Syncing…' : 'Sync models'}
          </AdminActionButton>
        </section>
      </div>
    </AiOpsResourceBoundary>
  );
}

function DataTable({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: string[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
