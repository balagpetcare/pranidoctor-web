"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { useAdminAuth } from "@/lib/admin-auth/AdminAuthProvider";
import { cn } from "@/lib/cn";

import {
  getAdminCapabilitySummaries,
  roleLabelBn,
} from "./admin-nav-permissions";

const panelClass =
  "absolute right-0 z-40 mt-1 w-[min(100vw-1.5rem,18rem)] rounded-[var(--pd-admin-radius-sm)] border border-[var(--pd-admin-border)] bg-[var(--pd-admin-surface)] shadow-lg dark:border-zinc-700 dark:bg-zinc-900";

const itemClass =
  "block w-full px-3 py-2 text-left text-sm text-zinc-800 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800";

export function AdminPermissionMenu() {
  const { user, can } = useAdminAuth();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const capabilities = getAdminCapabilitySummaries(user);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
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

  if (!user) return null;

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
        aria-label="অনুমতি ও ভূমিকা"
        title="অনুমতি ও ভূমিকা"
        onClick={() => setOpen((v) => !v)}
      >
        <ShieldCheck className="h-5 w-5" aria-hidden />
      </button>
      {open ? (
        <div id={menuId} role="menu" className={panelClass} lang="bn">
          <div className="border-b border-[var(--pd-admin-border)] px-3 py-3 dark:border-zinc-700">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--pd-admin-muted)]">
              ভূমিকা
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {roleLabelBn(user.role)}
            </p>
          </div>
          <div className="border-b border-[var(--pd-admin-border)] px-3 py-2 dark:border-zinc-700">
            <p className="mb-2 text-xs font-medium text-[var(--pd-admin-muted)]">এন্টারপ্রাইজ অনুমতি</p>
            <ul className="space-y-1">
              {capabilities.map((cap) => (
                <li
                  key={cap.id}
                  className={cn(
                    "rounded-[var(--pd-admin-radius-sm)] px-2 py-1.5 text-xs",
                    cap.granted
                      ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
                  )}
                >
                  {cap.labelBn}
                </li>
              ))}
            </ul>
          </div>
          <div className="py-1">
            {can("serviceInstance.view") ? (
              <Link
                href="/enterprise/services/review"
                role="menuitem"
                className={itemClass}
                onClick={() => setOpen(false)}
              >
                এন্টারপ্রাইজ সেবা পর্যালোচনা
              </Link>
            ) : null}
            <Link
              href="/admin/settings"
              role="menuitem"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              সেটিংস
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
