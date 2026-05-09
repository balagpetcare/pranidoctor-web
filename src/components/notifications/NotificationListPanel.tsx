"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/cn";

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

async function fetchNotifications(unreadOnly: boolean): Promise<ListData | null> {
  const qs = new URLSearchParams({
    limit: "50",
    offset: "0",
    unreadOnly: unreadOnly ? "true" : "false",
  });
  const res = await fetch(`/api/notifications?${qs.toString()}`, {
    credentials: "same-origin",
  });
  const json: unknown = await res.json();
  if (
    !res.ok ||
    typeof json !== "object" ||
    json === null ||
    !("ok" in json) ||
    json.ok !== true ||
    !("data" in json)
  ) {
    return null;
  }
  const data = json.data as ListData;
  if (!Array.isArray(data.items) || typeof data.total !== "number") {
    return null;
  }
  return data;
}

async function patchRead(id: string): Promise<boolean> {
  const res = await fetch(`/api/notifications/${id}/read`, {
    method: "PATCH",
    credentials: "same-origin",
  });
  const json: unknown = await res.json();
  return (
    res.ok &&
    typeof json === "object" &&
    json !== null &&
    "ok" in json &&
    json.ok === true
  );
}

async function patchReadAll(): Promise<boolean> {
  const res = await fetch("/api/notifications/read-all", {
    method: "PATCH",
    credentials: "same-origin",
  });
  const json: unknown = await res.json();
  return (
    res.ok &&
    typeof json === "object" &&
    json !== null &&
    "ok" in json &&
    json.ok === true
  );
}

export function NotificationListPanel({
  className,
  accent = "emerald",
}: {
  className?: string;
  accent?: "emerald" | "teal";
}) {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAll, setBusyAll] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await fetchNotifications(unreadOnly);
    if (!data) {
      setError(
        "নোটিফিকেশন লোড করা যায়নি। লগইন আছে কিনা পরীক্ষা করুন।",
      );
      setItems([]);
      setTotal(0);
    } else {
      setItems(data.items);
      setTotal(data.total);
    }
    setLoading(false);
  }, [unreadOnly]);

  useEffect(() => {
    queueMicrotask(() => {
      void reload();
    });
  }, [reload]);

  async function onMarkRead(id: string) {
    setBusyId(id);
    const ok = await patchRead(id);
    setBusyId(null);
    if (ok) await reload();
    else setError("একটি নোটিফিকেশন আপডেট করা যায়নি।");
  }

  async function onMarkAllRead() {
    setBusyAll(true);
    const ok = await patchReadAll();
    setBusyAll(false);
    if (ok) await reload();
    else setError("সব পড়া চিহ্নিত করা যায়নি।");
  }

  const unreadCount = items.filter((n) => !n.readAt).length;

  const markAllClass =
    accent === "teal"
      ? "bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
      : "bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500";

  const rowUnreadClass =
    accent === "teal"
      ? "bg-teal-50/60 dark:bg-teal-950/25"
      : "bg-emerald-50/60 dark:bg-emerald-950/25";

  const badgeUnreadClass =
    accent === "teal"
      ? "bg-teal-100 text-teal-900 dark:bg-teal-900/50 dark:text-teal-100"
      : "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100";

  return (
    <div className={cn("space-y-4", className)}>
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
          <button
            type="button"
            onClick={() => void reload()}
            disabled={loading}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            রিফ্রেশ
          </button>
          <button
            type="button"
            onClick={() => void onMarkAllRead()}
            disabled={busyAll || loading || total === 0}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50",
              markAllClass,
            )}
          >
            সব পড়া চিহ্নিত করুন
          </button>
        </div>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        মোট {total}
        {unreadOnly ? ` (ফিল্টার: অপঠিত)` : ""}
        {!unreadOnly && unreadCount > 0
          ? ` · এই পৃষ্ঠায় অপঠিত ${unreadCount}`
          : null}
      </p>

      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">লোড হচ্ছে…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          কোনো নোটিফিকেশন নেই।
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:divide-zinc-700 dark:border-zinc-800 dark:bg-zinc-900">
          {items.map((n) => {
            const unread = !n.readAt;
            return (
              <li
                key={n.id}
                className={cn(
                  "flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between",
                  unread ? rowUnreadClass : "",
                )}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                        unread
                          ? badgeUnreadClass
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
                      )}
                    >
                      {unread ? "অপঠিত" : "পঠিত"}
                    </span>
                    <span className="text-[11px] uppercase text-zinc-500 dark:text-zinc-400">
                      {n.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {n.title}
                  </h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {n.body}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {format(new Date(n.createdAt), "yyyy-MM-dd HH:mm")}
                  </p>
                </div>
                {unread ? (
                  <button
                    type="button"
                    disabled={busyId === n.id}
                    onClick={() => void onMarkRead(n.id)}
                    className="shrink-0 self-start rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    পড়া চিহ্নিত করুন
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
