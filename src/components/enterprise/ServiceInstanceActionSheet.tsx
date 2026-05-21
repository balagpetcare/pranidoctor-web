"use client";

import { useCallback, useEffect, useId, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { cn } from "@/lib/cn";

export type ActionSheetMode =
  | {
      kind: "note";
      title: string;
      noteLabel: string;
      noteRequired: boolean;
      confirmLabel: string;
      danger?: boolean;
    }
  | {
      kind: "confirm";
      title: string;
      description?: string;
      confirmLabel: string;
      danger?: boolean;
    };

type Props = {
  open: boolean;
  mode: ActionSheetMode | null;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void | Promise<void>;
};

export function ServiceInstanceActionSheet(props: Props) {
  const { open, mode, busy, onClose, onSubmit } = props;
  const titleId = useId();
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, busy, onClose]);

  const submit = useCallback(async () => {
    if (!mode) return;
    if (mode.kind === "note" && mode.noteRequired && !note.trim()) return;
    await onSubmit(mode.kind === "note" ? note.trim() : "");
  }, [mode, note, onSubmit]);

  if (!open || !mode) return null;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "max-h-[min(92dvh,640px)] w-full max-w-lg overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-950 sm:rounded-2xl",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <h2 id={titleId} className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {mode.title}
          </h2>
          {mode.kind === "confirm" && mode.description ? (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{mode.description}</p>
          ) : null}
        </div>
        {mode.kind === "note" ? (
          <div className="px-4 py-3">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {mode.noteLabel}
              {mode.noteRequired ? <span className="text-red-600"> *</span> : null}
            </label>
            <textarea
              className="mt-2 min-h-[120px] w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={busy}
              placeholder="বিস্তারিত লিখুন…"
            />
          </div>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <AdminActionButton variant="secondary" disabled={busy} onClick={onClose}>
            বাতিল
          </AdminActionButton>
          <AdminActionButton
            variant={mode.danger ? "danger" : "primary"}
            disabled={busy || (mode.kind === "note" && mode.noteRequired && !note.trim())}
            onClick={() => void submit()}
          >
            {busy ? "অপেক্ষা…" : mode.confirmLabel}
          </AdminActionButton>
        </div>
      </div>
    </div>
  );
}
