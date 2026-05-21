"use client";

import { useMemo } from "react";

import { cn } from "@/lib/cn";

function splitLines(s: string): string[] {
  return s.split("\n");
}

function DiffColumn(props: {
  label: string;
  lines: string[];
  other: string[];
  side: "left" | "right";
}) {
  const { label, lines, other, side } = props;
  const max = Math.max(lines.length, other.length);

  return (
    <div className="min-w-0 flex-1">
      <div className="sticky top-0 z-[1] border-b border-zinc-200 bg-zinc-50/95 px-2 py-1.5 text-xs font-semibold text-zinc-700 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95 dark:text-zinc-200">
        {label}
      </div>
      <div
        className={cn(
          "max-h-[min(70vh,28rem)] overflow-auto rounded-b-lg border border-t-0 border-zinc-200 bg-zinc-50 font-mono text-[11px] leading-[1.45] text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100",
          "[scrollbar-gutter:stable]",
        )}
      >
        {Array.from({ length: max }, (_, i) => {
          const a = lines[i];
          const b = other[i];
          const changed = a !== b;
          return (
            <div
              key={i}
              className={cn(
                "grid grid-cols-[2.25rem_1fr] border-b border-zinc-100/80 dark:border-zinc-800/80",
                changed &&
                  (side === "left"
                    ? "bg-amber-100/90 text-amber-950 dark:bg-amber-950/35 dark:text-amber-50"
                    : "bg-emerald-100/90 text-emerald-950 dark:bg-emerald-950/35 dark:text-emerald-50"),
                !changed && "bg-white/50 dark:bg-zinc-950/50",
              )}
            >
              <div className="select-none border-r border-zinc-200/80 pr-1 text-right text-[10px] tabular-nums text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                {i + 1}
              </div>
              <div className="break-all px-1.5 py-0.5 whitespace-pre-wrap">{a ?? ""}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function JsonDiffViewer(props: {
  leftLabel: string;
  rightLabel: string;
  left: unknown;
  right: unknown;
}) {
  const leftStr = useMemo(() => JSON.stringify(props.left ?? {}, null, 2), [props.left]);
  const rightStr = useMemo(() => JSON.stringify(props.right ?? {}, null, 2), [props.right]);
  const lLines = useMemo(() => splitLines(leftStr), [leftStr]);
  const rLines = useMemo(() => splitLines(rightStr), [rightStr]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 sm:p-3">
      <p className="mb-2 px-1 text-[11px] text-zinc-500 dark:text-zinc-400">
        লাইন-ভিত্তিক তুলনা (JSON টেক্সট) — হাইলাইট = পার্থক্য।
      </p>
      <div className="flex flex-col gap-3 lg:flex-row">
        <DiffColumn label={props.leftLabel} lines={lLines} other={rLines} side="left" />
        <DiffColumn label={props.rightLabel} lines={rLines} other={lLines} side="right" />
      </div>
    </div>
  );
}
