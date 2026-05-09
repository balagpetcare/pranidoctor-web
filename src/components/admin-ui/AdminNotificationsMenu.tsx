"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";

type NotificationList = {
  items: Array<{
    id: string;
    title: string;
    readAt: string | null;
    createdAt: string;
  }>;
  total: number;
};

const panelClass =
  "absolute right-0 z-40 mt-1 w-[min(100vw-1.5rem,20rem)] rounded-[var(--pd-admin-radius-sm)] border border-[var(--pd-admin-border)] bg-[var(--pd-admin-surface)] shadow-lg dark:border-zinc-700 dark:bg-zinc-900";

export function AdminNotificationsMenu() {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState<number | null>(null);
  const [preview, setPreview] = useState<NotificationList["items"]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const [unreadData, previewData] = await Promise.all([
        readAdminJson<NotificationList>(
          await adminFetch("/api/notifications?limit=1&offset=0&unreadOnly=true"),
        ),
        readAdminJson<NotificationList>(
          await adminFetch("/api/notifications?limit=5&offset=0&unreadOnly=false"),
        ),
      ]);
      setUnreadTotal(unreadData.total);
      setPreview(previewData.items.slice(0, 3));
      setStatus("idle");
    } catch {
      setUnreadTotal(null);
      setPreview([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    queueMicrotask(() => {
      void load();
    });
  }, [open, load]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  const showBadge = unreadTotal !== null && unreadTotal > 0;
  const badgeLabel =
    unreadTotal === null ? "" : unreadTotal > 99 ? "99+" : String(unreadTotal);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className={cn(
          "relative rounded-[var(--pd-admin-radius-sm)] p-2 text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-800",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-label="নোটিফিকেশন মেনু"
        title="নোটিফিকেশন ও SMS"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-5 w-5" aria-hidden />
        {showBadge ? (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-0.5 text-[10px] font-semibold leading-none text-white"
            aria-hidden
          >
            {badgeLabel}
          </span>
        ) : null}
      </button>
      {open ? (
        <div id={menuId} role="menu" className={panelClass} lang="bn">
          {status === "loading" ? (
            <div className="px-3 py-4 text-center text-sm text-[var(--pd-admin-muted)]">লোড হচ্ছে…</div>
          ) : status === "error" ? (
            <div className="space-y-3 px-3 py-4 text-center">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">নোটিফিকেশন দেখতে খুলুন</p>
              <Link
                href="/admin/notifications"
                role="menuitem"
                className="inline-flex rounded-[var(--pd-admin-radius-sm)] bg-emerald-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                onClick={() => setOpen(false)}
              >
                নোটিফিকেশন পেজ
              </Link>
            </div>
          ) : (
            <>
              <div className="border-b border-[var(--pd-admin-border)] px-3 py-2 dark:border-zinc-700">
                <p className="text-xs font-medium text-[var(--pd-admin-muted)]">
                  {unreadTotal !== null && unreadTotal > 0
                    ? `অপঠিত: ${unreadTotal > 99 ? "99+" : unreadTotal}`
                    : "সব পঠিত বা খালি"}
                </p>
              </div>
              {preview.length > 0 ? (
                <ul className="max-h-48 overflow-y-auto py-1">
                  {preview.map((n) => (
                    <li key={n.id}>
                      <Link
                        href="/admin/notifications"
                        role="menuitem"
                        className="block px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        onClick={() => setOpen(false)}
                      >
                        <span className="line-clamp-2 font-medium leading-snug">{n.title}</span>
                        {!n.readAt ? (
                          <span className="mt-0.5 block text-[11px] text-emerald-700 dark:text-emerald-400">
                            অপঠিত
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-3 text-center text-sm text-[var(--pd-admin-muted)]">
                  কোনো সাম্প্রতিক নোটিফিকেশন নেই
                </p>
              )}
              <div className="border-t border-[var(--pd-admin-border)] p-2 dark:border-zinc-700">
                <Link
                  href="/admin/notifications"
                  role="menuitem"
                  className="block w-full rounded-[var(--pd-admin-radius-sm)] px-3 py-2 text-center text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                  onClick={() => setOpen(false)}
                >
                  সব নোটিফিকেশন দেখুন
                </Link>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
