"use client";

import Link from "next/link";
import { LogOut, UserCircle2 } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";

type MeData = {
  user: {
    id: string;
    email: string;
    displayName: string | null;
  };
};

const panelClass =
  "absolute right-0 z-40 mt-1 w-64 min-w-[14rem] rounded-[var(--pd-admin-radius-sm)] border border-[var(--pd-admin-border)] bg-[var(--pd-admin-surface)] shadow-lg dark:border-zinc-700 dark:bg-zinc-900";

const itemClass =
  "block w-full px-3 py-2.5 text-left text-sm text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-zinc-200 dark:hover:bg-zinc-800";

export type AdminProfileMenuProps = Readonly<{
  onSignOut: () => void | Promise<void>;
}>;

export function AdminProfileMenu({ onSignOut }: AdminProfileMenuProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<MeData["user"] | null>(null);
  const [meAttempted, setMeAttempted] = useState(false);
  const [meLoading, setMeLoading] = useState(false);

  const loadMe = useCallback(async () => {
    setMeLoading(true);
    try {
      const data = await readAdminJson<MeData>(await adminFetch("/api/admin/auth/me"));
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setMeLoading(false);
      setMeAttempted(true);
    }
  }, []);

  useEffect(() => {
    if (!open || meAttempted) {
      return;
    }
    queueMicrotask(() => {
      void loadMe();
    });
  }, [open, meAttempted, loadMe]);

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

  const primaryLabel = user?.displayName?.trim() || user?.email || null;
  const secondaryLabel =
    user?.displayName?.trim() && user.email ? user.email : null;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className={cn(
          "rounded-[var(--pd-admin-radius-sm)] p-2 text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-800",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-label="প্রোফাইল মেনু"
        title="প্রোফাইল ও সেটিংস"
        onClick={() => setOpen((v) => !v)}
      >
        <UserCircle2 className="h-5 w-5" aria-hidden />
      </button>
      {open ? (
        <div id={menuId} role="menu" className={panelClass} lang="bn">
          <div className="border-b border-[var(--pd-admin-border)] px-3 py-3 dark:border-zinc-700">
            {meLoading ? (
              <p className="text-sm text-[var(--pd-admin-muted)]">লোড হচ্ছে…</p>
            ) : primaryLabel ? (
              <>
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {primaryLabel}
                </p>
                {secondaryLabel ? (
                  <p className="mt-0.5 truncate text-xs text-[var(--pd-admin-muted)]">{secondaryLabel}</p>
                ) : null}
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Admin</p>
                <p className="mt-0.5 text-xs text-[var(--pd-admin-muted)]">প্রাণী ডাক্তার</p>
              </>
            )}
          </div>
          <div className="py-1">
            <Link
              href="/admin/settings"
              role="menuitem"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              সেটিংস
            </Link>
            <Link
              href="/admin/settings/billing"
              role="menuitem"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              বিলিং সেটিংস
            </Link>
            <button
              type="button"
              role="menuitem"
              className={cn(itemClass, "flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200")}
              onClick={() => {
                setOpen(false);
                void onSignOut();
              }}
            >
              <LogOut className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              লগ আউট
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
