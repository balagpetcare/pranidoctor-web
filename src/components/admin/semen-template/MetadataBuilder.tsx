"use client";

import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { khInputClass, khLabelClass } from "@/components/admin/knowledge-hub/styles";
import { cn } from "@/lib/cn";

type Row = { clientKey: string; k: string; v: string };

function rowsToJson(rows: Row[]): string {
  const obj: Record<string, string> = {};
  for (const r of rows) {
    const key = r.k.trim();
    if (!key) continue;
    obj[key] = r.v;
  }
  return Object.keys(obj).length === 0 ? "" : JSON.stringify(obj, null, 2);
}

function parseJsonToRows(text: string): { rows: Row[]; error: string | null } {
  const t = text.trim();
  if (!t) return { rows: [{ clientKey: crypto.randomUUID(), k: "", v: "" }], error: null };
  try {
    const parsed = JSON.parse(t) as unknown;
    if (parsed === null) return { rows: [{ clientKey: crypto.randomUUID(), k: "", v: "" }], error: null };
    if (typeof parsed !== "object" || Array.isArray(parsed)) {
      return { rows: [], error: "JSON অবশ্যই অবজেক্ট হতে হবে (তালিকা নয়)।" };
    }
    const entries = Object.entries(parsed as Record<string, unknown>);
    const rows: Row[] = entries.map(([k, val]) => ({
      clientKey: crypto.randomUUID(),
      k,
      v: typeof val === "string" ? val : JSON.stringify(val),
    }));
    return {
      rows: rows.length > 0 ? rows : [{ clientKey: crypto.randomUUID(), k: "", v: "" }],
      error: null,
    };
  } catch {
    return { rows: [], error: "অবৈধ JSON।" };
  }
}

export type MetadataBuilderProps = Readonly<{
  valueJson: string;
  onChange: (jsonText: string) => void;
  disabled?: boolean;
}>;

export function MetadataBuilder(props: MetadataBuilderProps) {
  const { valueJson, onChange, disabled } = props;
  const [rows, setRows] = useState<Row[]>([{ clientKey: crypto.randomUUID(), k: "", v: "" }]);
  const [parseError, setParseError] = useState<string | null>(null);
  const lastEmittedRef = useRef<string>("");

  const emit = useCallback(
    (next: Row[]) => {
      const json = rowsToJson(next);
      lastEmittedRef.current = json;
      setRows(next);
      onChange(json);
      setParseError(null);
    },
    [onChange],
  );

  useEffect(() => {
    if (valueJson === lastEmittedRef.current) return;
    const { rows: next, error } = parseJsonToRows(valueJson);
    lastEmittedRef.current = valueJson;
    queueMicrotask(() => {
      if (error) {
        setParseError(error);
        return;
      }
      setParseError(null);
      setRows(next);
    });
  }, [valueJson]);

  const duplicateKeys = useMemo(() => {
    const seen = new Set<string>();
    const dup = new Set<string>();
    for (const r of rows) {
      const k = r.k.trim();
      if (!k) continue;
      if (seen.has(k)) dup.add(k);
      seen.add(k);
    }
    return dup;
  }, [rows]);

  const hasEntries = useMemo(
    () => rows.some((r) => r.k.trim().length > 0 || r.v.trim().length > 0),
    [rows],
  );

  function addRow() {
    emit([...rows, { clientKey: crypto.randomUUID(), k: "", v: "" }]);
  }

  function removeRow(i: number) {
    emit(rows.filter((_, idx) => idx !== i));
  }

  function patchRow(i: number, patch: Partial<Row>) {
    emit(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <label className={cn(khLabelClass(), "text-xs font-semibold text-zinc-800 dark:text-zinc-100")}>
            কী–মান সারি
          </label>
          <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            সিস্টেম ফিল্টার/রিপোর্টে ব্যবহারের জন্য ছোট ট্যাগ যোগ করুন। উদাহরণ: tier, source, region।
          </p>
        </div>
        <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
          মোট {rows.length} সারি
        </span>
      </div>
      {parseError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          {parseError}
          <AdminActionButton
            type="button"
            variant="ghost"
            className="!ml-2 !inline !min-h-0 !px-2 !py-0.5 text-[11px]"
            disabled={disabled}
            onClick={() => {
              lastEmittedRef.current = "";
              emit([{ clientKey: crypto.randomUUID(), k: "", v: "" }]);
            }}
          >
            খালি করুন
          </AdminActionButton>
        </div>
      ) : null}
      {duplicateKeys.size > 0 ? (
        <p className="text-xs text-rose-600 dark:text-rose-400">
          ডুপ্লিকেট কী: {[...duplicateKeys].join(", ")} — সংরক্ষণের আগে ঠিক করুন।
        </p>
      ) : null}

      {!hasEntries ? (
        <div className="rounded-xl border border-dashed border-emerald-200/80 bg-emerald-50/30 px-4 py-3 text-[11px] text-emerald-900 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/25 dark:text-emerald-100">
          <p className="font-semibold">মেটাডেটা যোগ করলে দ্রুত ফিল্টার/বিশ্লেষণ করা সহজ হবে।</p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
            {["tier: premium", "source: ai", "region: north", "channel: partner"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-emerald-200/80 bg-white/70 px-2 py-0.5 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-100"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[var(--pd-admin-radius)] border border-zinc-200/90 bg-[var(--pd-admin-surface)] shadow-sm dark:border-zinc-700 dark:bg-zinc-950/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-left text-[11px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-gradient-to-r from-zinc-50 via-white to-zinc-50 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 dark:text-zinc-400">
                <th scope="col" className="px-3 py-3 sm:w-[38%]">
                  কী
                </th>
                <th scope="col" className="px-3 py-3">
                  মান
                </th>
                <th scope="col" className="w-12 px-2 py-3 text-right sm:w-14">
                  <span className="sr-only">কার্যকলাপ</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((r, i) => (
                <tr
                  key={r.clientKey}
                  className="group/row bg-white/80 transition-colors duration-200 hover:bg-emerald-50/30 dark:bg-transparent dark:hover:bg-emerald-950/15"
                >
                  <td className="px-3 py-2.5 align-middle">
                    <label className={cn(khLabelClass(), "sr-only")}>কী সারি {i + 1}</label>
                    <input
                      value={r.k}
                      onChange={(e) => patchRow(i, { k: e.target.value })}
                      className={cn(khInputClass(), "min-w-0 bg-white/80 dark:bg-zinc-950/40")}
                      disabled={disabled}
                      placeholder="উদাহরণ: tier"
                      aria-invalid={duplicateKeys.has(r.k.trim()) || undefined}
                    />
                  </td>
                  <td className="px-3 py-2.5 align-middle">
                    <label className={cn(khLabelClass(), "sr-only")}>মান সারি {i + 1}</label>
                    <input
                      value={r.v}
                      onChange={(e) => patchRow(i, { v: e.target.value })}
                      className={cn(khInputClass(), "min-w-0 bg-white/80 dark:bg-zinc-950/40")}
                      disabled={disabled}
                      placeholder="উদাহরণ: premium"
                    />
                  </td>
                  <td className="px-2 py-2.5 align-middle text-right">
                    <AdminActionButton
                      type="button"
                      variant="ghost"
                      className="!p-2 text-rose-700 transition hover:bg-rose-50 group-hover/row:opacity-100 dark:text-rose-300 dark:hover:bg-rose-950/40"
                      disabled={disabled || rows.length <= 1}
                      onClick={() => removeRow(i)}
                      aria-label={`সারি ${i + 1} মুছুন`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </AdminActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
        <p className="leading-relaxed">খালি কী সহ সারি সংরক্ষণে বাদ পড়বে। সব খালি থাকলে মেটাডেটা null যাবে।</p>
        <AdminActionButton
          type="button"
          variant="secondary"
          className="!px-3 !py-2 text-[11px] font-semibold shadow-sm transition hover:shadow-md"
          disabled={disabled}
          onClick={addRow}
        >
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" aria-hidden />
            নতুন সারি যোগ করুন
          </span>
        </AdminActionButton>
      </div>
    </div>
  );
}
