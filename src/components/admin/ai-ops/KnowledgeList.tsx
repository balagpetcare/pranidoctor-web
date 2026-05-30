'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';

type Entry = {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string;
  contentType: string;
  status: string;
};

export function KnowledgeList() {
  const [items, setItems] = useState<Entry[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await readAdminJson<Entry[]>(await adminFetch('/api/admin/ai-ops/knowledge'));
      setItems(data);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function publish(id: string) {
    await readAdminJson(await adminFetch(`/api/admin/ai-ops/knowledge/${id}/publish`, { method: 'POST' }));
    await load();
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Knowledge base" description="Disease, vaccine, and emergency content" />
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Slug</th>
            <th>Title (BN)</th>
            <th>Type</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.id} className="border-b">
              <td className="py-2 font-mono text-xs">{e.slug}</td>
              <td>{e.titleBn}</td>
              <td>{e.contentType}</td>
              <td>{e.status}</td>
              <td>
                {e.status !== 'PUBLISHED' ? (
                  <button type="button" className="text-sm text-blue-600" onClick={() => void publish(e.id)}>
                    Publish
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
