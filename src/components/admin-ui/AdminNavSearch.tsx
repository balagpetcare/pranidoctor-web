"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { flattenAdminNavGroups, type AdminNavGroup, type AdminNavItem } from "./admin-nav";

export type AdminNavSearchProps = Readonly<{
  groups: AdminNavGroup[];
  className?: string;
  /** Compact icon trigger for mobile topbar. */
  compact?: boolean;
}>;

function scoreItem(item: AdminNavItem, q: string): number {
  const needle = q.trim().toLowerCase();
  if (!needle) return 0;
  const hay = `${item.labelBn} ${item.titleEn} ${item.href}`.toLowerCase();
  if (hay.startsWith(needle)) return 3;
  if (item.labelBn.toLowerCase().includes(needle)) return 2;
  if (hay.includes(needle)) return 1;
  return 0;
}

export function AdminNavSearch({ groups, className, compact = false }: AdminNavSearchProps) {
  const items = useMemo(() => flattenAdminNavGroups(groups), [groups]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return items.slice(0, 8);
    return items
      .map((item) => ({ item, score: scoreItem(item, q) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.item.labelBn.localeCompare(b.item.labelBn, "bn"))
      .slice(0, 12)
      .map((r) => r.item);
  }, [items, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => inputRef.current?.focus());
    }
  }, [open]);

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setActiveIndex(0);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      close();
      window.location.assign(results[activeIndex]!.href);
    }
  }

  return (
    <>
      {compact ? (
        <button
          type="button"
          className={cn(
            "shrink-0 rounded-[var(--pd-admin-radius-sm)] p-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800",
            className,
          )}
          aria-label="অনুসন্ধান"
          title="অনুসন্ধান (Ctrl+K)"
          onClick={() => setOpen(true)}
        >
          <Search className="h-5 w-5" aria-hidden />
        </button>
      ) : (
        <button
          type="button"
          className={cn(
            "hidden min-w-0 flex-1 items-center gap-2 rounded-[var(--pd-admin-radius-sm)] border border-[var(--pd-admin-border)] bg-[var(--pd-admin-surface)] px-3 py-2 text-left text-sm text-[var(--pd-admin-muted)] transition-colors hover:border-emerald-600/40 hover:bg-zinc-50 lg:flex lg:max-w-md xl:max-w-lg dark:hover:bg-zinc-900/60",
            className,
          )}
          onClick={() => setOpen(true)}
          aria-label="অ্যাডমিন মেনু অনুসন্ধান"
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">মডিউল খুঁজুন…</span>
          <kbd className="ml-auto hidden rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline dark:border-zinc-700">
            Ctrl+K
          </kbd>
        </button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/45 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-16"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-[var(--pd-admin-radius)] border border-[var(--pd-admin-border)] bg-[var(--pd-admin-surface)] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="অ্যাডমিন অনুসন্ধান"
            lang="bn"
          >
            <div className="flex items-center gap-2 border-b border-[var(--pd-admin-border)] px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-[var(--pd-admin-muted)]" aria-hidden />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={onInputChange}
                onKeyDown={onInputKeyDown}
                placeholder="মডিউল, পেজ বা রুট খুঁজুন…"
                className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
                autoComplete="off"
              />
              <button
                type="button"
                className="rounded-[var(--pd-admin-radius-sm)] p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="বন্ধ করুন"
                onClick={close}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <ul className="max-h-[min(60vh,24rem)] overflow-y-auto py-1">
              {results.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-[var(--pd-admin-muted)]">
                  কোনো ফলাফল নেই
                </li>
              ) : (
                results.map((item, index) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex flex-col gap-0.5 px-4 py-2.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
                        index === activeIndex && "bg-emerald-50 dark:bg-emerald-950/30",
                      )}
                      onClick={close}
                    >
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">{item.labelBn}</span>
                      <span className="text-xs text-[var(--pd-admin-muted)]">{item.titleEn}</span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
