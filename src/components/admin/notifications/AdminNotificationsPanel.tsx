"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin-ui/AdminEmptyState";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { AdminTable } from "@/components/admin-ui/AdminTable";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";

import { inAppNotificationReadBadge, notificationTypeBn } from "./notification-sms-labels";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

type ListData = {
  items: NotificationRow[];
  total: number;
};

export function AdminNotificationsPanel() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAll, setBusyAll] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: "50",
        offset: "0",
        unreadOnly: unreadOnly ? "true" : "false",
      });
      const data = await readAdminJson<ListData>(
        await adminFetch(`/api/notifications?${params.toString()}`),
      );
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "নোটিফিকেশন লোড করা যায়নি। লগইন আছে কিনা পরীক্ষা করুন।",
      );
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
     
    void reload();
  }, [reload, refreshKey]);

  async function onMarkRead(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await readAdminJson<{ notification: unknown }>(
        await adminFetch(`/api/notifications/${id}/read`, { method: "PATCH" }),
      );
      setRefreshKey((k) => k + 1);
    } catch {
      setError("একটি নোটিফিকেশন আপডেট করা যায়নি।");
    } finally {
      setBusyId(null);
    }
  }

  async function onMarkAllRead() {
    setBusyAll(true);
    setError(null);
    try {
      await readAdminJson<{ updatedCount: number }>(
        await adminFetch("/api/notifications/read-all", { method: "PATCH" }),
      );
      setRefreshKey((k) => k + 1);
    } catch {
      setError("সব পড়া চিহ্নিত করা যায়নি।");
    } finally {
      setBusyAll(false);
    }
  }

  const unreadCount = items.filter((n) => !n.readAt).length;
  const showInitialLoading = loading && items.length === 0;
  const showEmpty = !loading && !error && items.length === 0;

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={unreadOnly}
          onChange={(e) => setUnreadOnly(e.target.checked)}
          className="rounded border-zinc-300 dark:border-zinc-600"
        />
        শুধু অপঠিত
      </label>
      <div className="flex flex-wrap gap-2">
        <AdminActionButton
          type="button"
          variant="secondary"
          disabled={loading}
          onClick={() => setRefreshKey((k) => k + 1)}
        >
          রিফ্রেশ
        </AdminActionButton>
        <AdminActionButton
          type="button"
          variant="primary"
          disabled={busyAll || loading || total === 0}
          onClick={() => void onMarkAllRead()}
        >
          সব পড়া চিহ্নিত করুন
        </AdminActionButton>
      </div>
    </div>
  );

  return (
    <AdminFormSection
      title="নোটিফিকেশন"
      description={
        <>
          মোট {total}
          {unreadOnly ? ` · ফিল্টার: অপঠিত` : ""}
          {!unreadOnly && unreadCount > 0 ? ` · এই পৃষ্ঠায় অপঠিত ${unreadCount}` : null}
        </>
      }
    >
      <div className="rounded-lg border border-zinc-200/90 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        {toolbar}
      </div>

      {error ? (
        <AdminErrorState message={error} onRetry={() => setRefreshKey((k) => k + 1)} />
      ) : null}

      {showInitialLoading ? <AdminLoadingState message="নোটিফিকেশন লোড হচ্ছে…" /> : null}

      {showEmpty ? (
        <AdminEmptyState
          title="কোনো নোটিফিকেশন নেই"
          description="নতুন সার্ভিস রিকোয়েস্ট ও সিস্টেম আপডেট এখানে দেখাবে।"
        />
      ) : null}

      {!error && !showInitialLoading && !showEmpty ? (
        <AdminTable>
          <thead className="bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-3">অবস্থা</th>
              <th className="px-3 py-3">ধরন</th>
              <th className="px-3 py-3">বার্তা</th>
              <th className="px-3 py-3">সময়</th>
              <th className="px-3 py-3 text-end">কাজ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-[var(--pd-admin-surface)] dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-zinc-500">
                  লোড হচ্ছে…
                </td>
              </tr>
            ) : (
              items.map((n) => {
                const read = !!n.readAt;
                const readBadge = inAppNotificationReadBadge(read);
                return (
                  <tr
                    key={n.id}
                    className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                  >
                    <td className="align-top px-3 py-3">
                      <AdminBadge variant={readBadge.variant}>{readBadge.label}</AdminBadge>
                    </td>
                    <td className="align-top px-3 py-3">
                      <AdminBadge variant="neutral" className="font-normal">
                        {notificationTypeBn(n.type)}
                      </AdminBadge>
                    </td>
                    <td className="max-w-md align-top px-3 py-3">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {n.title}
                      </div>
                      <p className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                        {n.body}
                      </p>
                    </td>
                    <td className="whitespace-nowrap align-top px-3 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                      {format(new Date(n.createdAt), "yyyy-MM-dd HH:mm")}
                    </td>
                    <td className="align-top px-3 py-3 text-end">
                      {!read ? (
                        <AdminActionButton
                          type="button"
                          variant="secondary"
                          className="h-auto min-h-0 px-2 py-1 text-xs"
                          disabled={busyId === n.id}
                          onClick={() => void onMarkRead(n.id)}
                        >
                          পড়া চিহ্নিত করুন
                        </AdminActionButton>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </AdminTable>
      ) : null}
    </AdminFormSection>
  );
}
