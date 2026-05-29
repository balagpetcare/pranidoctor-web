'use client';

import { useCallback, useEffect, useState } from 'react';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';
import { AdminErrorState } from '@/components/admin-ui/AdminErrorState';
import { AdminFormSection } from '@/components/admin-ui/AdminFormSection';
import { AdminLoadingState } from '@/components/admin-ui/AdminLoadingState';
import { AdminStatCard } from '@/components/admin-ui/AdminStatCard';
import { adminFetch } from '@/lib/admin/admin-fetch';
import { readAdminJson } from '@/lib/admin/read-admin-json';
import type { SeedPreview, SeedRunReport } from '@/types/feed-ecosystem';

export function SeedManagementPanel() {
  const [preview, setPreview] = useState<SeedPreview | null>(null);
  const [lastRun, setLastRun] = useState<SeedRunReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{ preview: SeedPreview; lastRun: SeedRunReport | null }>(
        await adminFetch('/api/admin/feed-ecosystem/seed'),
      );
      setPreview(data.preview);
      setLastRun(data.lastRun);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runSeed(target: 'feed_items' | 'vendors' | 'all') {
    setRunning(true);
    setMessage(null);
    setError(null);
    try {
      const data = await readAdminJson<{ report: SeedRunReport }>(
        await adminFetch('/api/admin/feed-ecosystem/seed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target }),
        }),
      );
      setLastRun(data.report);
      setMessage(data.report.errors.length ? 'সিড চলেছে — কিছু ত্রুটি দেখুন' : 'সিড সফল');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'সিড ব্যর্থ');
    } finally {
      setRunning(false);
    }
  }

  if (loading && !preview) return <AdminLoadingState message="সিড প্রিভিউ লোড…" />;
  if (error && !preview) return <AdminErrorState message={error} onRetry={() => void load()} />;
  if (!preview) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard
          title="FeedItem (DB)"
          value={`${preview.feedItems.dbCount} / ${preview.feedItems.seedFileCount}`}
          description={`Seeded: ${preview.feedItems.seededCount}`}
        />
        <AdminStatCard
          title="Vendor (DB)"
          value={`${preview.vendors.dbCount} / ${preview.vendors.seedFileCount}`}
          description={`Seeded: ${preview.vendors.seededCount}`}
        />
        <AdminStatCard
          title="FeedCatalog (legacy)"
          value={String(preview.feedCatalog.dbCount)}
          description={`Seeded: ${preview.feedCatalog.seededCount}`}
        />
      </div>

      <AdminFormSection title="সিড চালান (SUPER_ADMIN)">
        <div className="flex flex-wrap gap-2">
          <AdminActionButton type="button" variant="primary" disabled={running} onClick={() => void runSeed('feed_items')}>
            Feed Items
          </AdminActionButton>
          <AdminActionButton type="button" variant="secondary" disabled={running} onClick={() => void runSeed('vendors')}>
            Vendors
          </AdminActionButton>
          <AdminActionButton type="button" variant="secondary" disabled={running} onClick={() => void runSeed('all')}>
            সব
          </AdminActionButton>
        </div>
      </AdminFormSection>

      {lastRun ? (
        <AdminFormSection title="সর্বশেষ রান">
          <pre className="overflow-x-auto rounded-lg bg-zinc-50 p-4 text-xs dark:bg-zinc-900">
            {JSON.stringify(lastRun, null, 2)}
          </pre>
        </AdminFormSection>
      ) : null}

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <AdminErrorState message={error} /> : null}
    </div>
  );
}
