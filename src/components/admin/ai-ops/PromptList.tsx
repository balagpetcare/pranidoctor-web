'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';

type PromptKind = 'system' | 'feature';

type Prompt = {
  id: string;
  promptKey: string;
  key: string;
  name: string;
  description: string | null;
  kind: PromptKind;
  taskType: string | null;
  status: string;
  published: boolean;
  version: number;
  updatedAt: string;
};

type KindFilter = 'all' | PromptKind;

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'DRAFT':
      return 'bg-amber-100 text-amber-800';
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function PromptList() {
  const [items, setItems] = useState<Prompt[]>([]);
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [versions, setVersions] = useState<Prompt[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (kindFilter !== 'all') params.set('kind', kindFilter);
    if (includeArchived) params.set('includeArchived', 'true');
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [kindFilter, includeArchived]);

  const load = useCallback(async () => {
    try {
      const data = await readAdminJson<Prompt[]>(
        await adminFetch(`/api/admin/ai-ops/prompts${query}`),
      );
      setItems(data);
    } catch {
      setItems([]);
    }
  }, [query]);

  const loadVersions = useCallback(async (promptKey: string) => {
    try {
      const data = await readAdminJson<Prompt[]>(
        await adminFetch(
          `/api/admin/ai-ops/prompts/keys/${encodeURIComponent(promptKey)}/versions?includeArchived=true`,
        ),
      );
      setVersions(data);
    } catch {
      setVersions([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (expandedKey) void loadVersions(expandedKey);
    else setVersions([]);
  }, [expandedKey, loadVersions]);

  async function withReload(action: () => Promise<unknown>) {
    await action();
    await load();
    if (expandedKey) await loadVersions(expandedKey);
  }

  async function publish(id: string) {
    setBusyId(id);
    try {
      await withReload(async () => {
        await readAdminJson(
          await adminFetch(`/api/admin/ai-ops/prompts/${id}/publish`, { method: 'POST' }),
        );
      });
    } finally {
      setBusyId(null);
    }
  }

  async function rollback(id: string) {
    setBusyId(id);
    try {
      await withReload(async () => {
        await readAdminJson(
          await adminFetch(`/api/admin/ai-ops/prompts/${id}/rollback`, { method: 'POST' }),
        );
      });
    } finally {
      setBusyId(null);
    }
  }

  async function createDraftFromPublished(promptKey: string) {
    setBusyId(promptKey);
    try {
      await withReload(async () => {
        await readAdminJson(
          await adminFetch(
            `/api/admin/ai-ops/prompts/keys/${encodeURIComponent(promptKey)}/drafts`,
            { method: 'POST' },
          ),
        );
      });
    } finally {
      setBusyId(null);
    }
  }

  async function deleteDraft(id: string) {
    setBusyId(id);
    try {
      await withReload(async () => {
        await adminFetch(`/api/admin/ai-ops/prompts/${id}`, { method: 'DELETE' });
      });
    } finally {
      setBusyId(null);
    }
  }

  function toggleVersions(promptKey: string) {
    setExpandedKey((current) => (current === promptKey ? null : promptKey));
  }

  const grouped = useMemo(() => {
    const map = new Map<string, Prompt[]>();
    for (const item of items) {
      const list = map.get(item.promptKey) ?? [];
      list.push(item);
      map.set(item.promptKey, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Prompt management"
        description="Versioned system and feature prompts — edit drafts without deployment, then publish or rollback"
      />

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-gray-600">Kind</span>
          <select
            className="rounded border px-2 py-1"
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as KindFilter)}
          >
            <option value="all">All</option>
            <option value="system">System</option>
            <option value="feature">Feature</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
          />
          <span className="text-gray-600">Include archived</span>
        </label>
      </div>

      <div className="space-y-3">
        {grouped.map(([promptKey, rows]) => {
          const published = rows.find((r) => r.status === 'ACTIVE');
          const hasDraft = rows.some((r) => r.status === 'DRAFT');
          const latest = rows[0];

          return (
            <section key={promptKey} className="rounded border bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
                <div>
                  <p className="font-medium">{latest?.name ?? promptKey}</p>
                  <p className="text-sm text-gray-500">
                    {promptKey}
                    {latest?.kind ? ` · ${latest.kind}` : ''}
                    {latest?.taskType ? ` · ${latest.taskType}` : ''}
                  </p>
                  {published ? (
                    <p className="mt-1 text-xs text-green-700">
                      Live: v{published.version} (published {new Date(published.updatedAt).toLocaleString()})
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-amber-700">No published version</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="text-sm text-blue-600"
                    onClick={() => toggleVersions(promptKey)}
                  >
                    {expandedKey === promptKey ? 'Hide versions' : 'Versions'}
                  </button>
                  {published && !hasDraft ? (
                    <button
                      type="button"
                      className="text-sm text-blue-600 disabled:opacity-50"
                      disabled={busyId === promptKey}
                      onClick={() => void createDraftFromPublished(promptKey)}
                    >
                      Edit as draft
                    </button>
                  ) : null}
                </div>
              </div>

              {expandedKey === promptKey ? (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                      <th className="px-4 py-2">Version</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {(versions.length > 0 ? versions : rows).map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="px-4 py-2 font-mono">v{p.version}</td>
                        <td>
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadgeClass(p.status)}`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="text-gray-500">{new Date(p.updatedAt).toLocaleString()}</td>
                        <td className="py-2 text-right">
                          {p.status === 'DRAFT' ? (
                            <span className="inline-flex gap-3">
                              <button
                                type="button"
                                className="text-blue-600 disabled:opacity-50"
                                disabled={busyId === p.id}
                                onClick={() => void publish(p.id)}
                              >
                                Publish
                              </button>
                              <button
                                type="button"
                                className="text-red-600 disabled:opacity-50"
                                disabled={busyId === p.id}
                                onClick={() => void deleteDraft(p.id)}
                              >
                                Delete
                              </button>
                            </span>
                          ) : null}
                          {p.status === 'ARCHIVED' ? (
                            <button
                              type="button"
                              className="text-blue-600 disabled:opacity-50"
                              disabled={busyId === p.id}
                              onClick={() => void rollback(p.id)}
                            >
                              Rollback
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </section>
          );
        })}
        {grouped.length === 0 ? (
          <p className="rounded border bg-white px-4 py-8 text-center text-sm text-gray-500">
            No prompts found.
          </p>
        ) : null}
      </div>
    </div>
  );
}
