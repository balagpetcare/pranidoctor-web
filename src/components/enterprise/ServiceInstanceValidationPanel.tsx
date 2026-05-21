"use client";

import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { cn } from "@/lib/cn";

type Issue = { path: string; messageBn: string };

function parseValidation(raw: unknown): {
  ok: boolean | null;
  issues: Issue[];
  rawFallback: boolean;
} {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: null, issues: [], rawFallback: true };
  }
  const o = raw as Record<string, unknown>;
  if (o.ok === true) {
    return { ok: true, issues: [], rawFallback: false };
  }
  if (o.ok === false && Array.isArray(o.issues)) {
    const issues: Issue[] = [];
    for (const it of o.issues) {
      if (it && typeof it === "object" && !Array.isArray(it)) {
        const row = it as Record<string, unknown>;
        const path = typeof row.path === "string" ? row.path : "?";
        const messageBn =
          typeof row.messageBn === "string" ? row.messageBn : String(row.message ?? "");
        if (messageBn) issues.push({ path, messageBn });
      }
    }
    return { ok: false, issues, rawFallback: false };
  }
  return { ok: null, issues: [], rawFallback: true };
}

export function ServiceInstanceValidationPanel(props: {
  validationResultJson: unknown;
  className?: string;
}) {
  const parsed = parseValidation(props.validationResultJson);

  if (parsed.rawFallback) {
    return (
      <div className={cn("rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50", props.className)}>
        <div className="border-b border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          যাচাইকরণ (কাঁচা JSON)
        </div>
        <pre className="max-h-48 overflow-auto p-3 font-mono text-xs leading-relaxed text-zinc-800 dark:text-zinc-200">
          {JSON.stringify(props.validationResultJson ?? {}, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950",
        props.className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">পেলোড যাচাইকরণ</span>
        {parsed.ok === true ? (
          <AdminBadge variant="success">সব ঠিক</AdminBadge>
        ) : parsed.ok === false ? (
          <AdminBadge variant="danger">সমস্যা</AdminBadge>
        ) : null}
      </div>
      {parsed.ok === true ? (
        <p className="px-3 py-3 text-sm text-zinc-600 dark:text-zinc-400">
          সর্বশেষ যাচাইকরণে কোনো নিয়ম লঙ্ঘন পাওয়া যায়নি।
        </p>
      ) : (
        <ul className="max-h-56 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
          {parsed.issues.length === 0 ? (
            <li className="px-3 py-3 text-sm text-zinc-500">বিস্তারিত ইস্যু পাওয়া যায়নি।</li>
          ) : (
            parsed.issues.map((iss, i) => (
              <li key={`${iss.path}-${i}`} className="px-3 py-2.5">
                <div className="font-mono text-[10px] uppercase tracking-wide text-zinc-500">{iss.path}</div>
                <div className="mt-0.5 text-sm text-zinc-900 dark:text-zinc-100">{iss.messageBn}</div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
