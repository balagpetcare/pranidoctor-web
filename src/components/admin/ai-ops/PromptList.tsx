'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';

type Prompt = {
  id: string;
  key: string;
  name: string;
  status: string;
  version: number;
};

export function PromptList() {
  const [items, setItems] = useState<Prompt[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await readAdminJson<Prompt[]>(await adminFetch('/api/admin/ai-ops/prompts'));
      setItems(data);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function activate(id: string) {
    await readAdminJson(await adminFetch(`/api/admin/ai-ops/prompts/${id}/activate`, { method: 'POST' }));
    await load();
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Prompt management" subtitle="Versioned AI system prompts" />
      <ul className="divide-y rounded border bg-white">
        {items.map((p) => (
          <li key={p.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500">
                {p.key} · v{p.version}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase text-gray-600">{p.status}</span>
              {p.status !== 'ACTIVE' ? (
                <button type="button" className="text-sm text-blue-600" onClick={() => void activate(p.id)}>
                  Activate
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
