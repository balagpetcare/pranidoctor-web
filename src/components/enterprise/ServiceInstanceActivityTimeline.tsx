"use client";

import { useMemo } from "react";

import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { cn } from "@/lib/cn";

type TimelineEntry = {
  id: string;
  at: string;
  tone: "status" | "review" | "publish" | "audit";
  title: string;
  body?: string;
  meta?: string;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

function iso(d: unknown): string | null {
  if (typeof d === "string") return d;
  if (d instanceof Date) return d.toISOString();
  return null;
}

function formatWhen(isoStr: string | null): string {
  if (!isoStr) return "—";
  try {
    return new Date(isoStr).toLocaleString("bn-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return isoStr;
  }
}

function collectEntries(input: {
  statusLogs?: unknown;
  reviews?: unknown;
  publishLogs?: unknown;
  auditEvents?: unknown;
}): TimelineEntry[] {
  const out: TimelineEntry[] = [];

  if (Array.isArray(input.statusLogs)) {
    for (const row of input.statusLogs) {
      const r = asRecord(row);
      if (!r) continue;
      const id = typeof r.id === "string" ? r.id : Math.random().toString(36);
      const at = iso(r.createdAt) ?? "";
      const from = r.fromStatus != null ? String(r.fromStatus) : "—";
      const to = String(r.toStatus ?? "?");
      const role = typeof r.actorRole === "string" ? r.actorRole : "";
      const reason = typeof r.reason === "string" && r.reason.trim() ? r.reason.trim() : undefined;
      out.push({
        id: `s-${id}`,
        at,
        tone: "status",
        title: `অবস্থা: ${from} → ${to}`,
        body: reason,
        meta: role ? `ভূমিকা: ${role}` : undefined,
      });
    }
  }

  if (Array.isArray(input.reviews)) {
    for (const row of input.reviews) {
      const r = asRecord(row);
      if (!r) continue;
      const id = typeof r.id === "string" ? r.id : Math.random().toString(36);
      const at = iso(r.createdAt) ?? "";
      const decision = String(r.decision ?? "?");
      const body = typeof r.body === "string" ? r.body : undefined;
      const reviewer = typeof r.reviewerUserId === "string" ? r.reviewerUserId.slice(0, 10) : "";
      out.push({
        id: `r-${id}`,
        at,
        tone: "review",
        title: `পর্যালোচনা: ${decision}`,
        body,
        meta: reviewer ? `রিভিউয়ার: ${reviewer}…` : undefined,
      });
    }
  }

  if (Array.isArray(input.publishLogs)) {
    for (const row of input.publishLogs) {
      const r = asRecord(row);
      if (!r) continue;
      const id = typeof r.id === "string" ? r.id : Math.random().toString(36);
      const at = iso(r.createdAt) ?? "";
      const action = String(r.action ?? "?");
      out.push({
        id: `p-${id}`,
        at,
        tone: "publish",
        title: `প্রকাশ: ${action}`,
        meta:
          r.newPublishedServiceId != null
            ? `নতুন সেবা আইডি: ${String(r.newPublishedServiceId).slice(0, 12)}…`
            : undefined,
      });
    }
  }

  if (Array.isArray(input.auditEvents)) {
    for (const row of input.auditEvents) {
      const r = asRecord(row);
      if (!r) continue;
      const id = typeof r.id === "string" ? r.id : Math.random().toString(36);
      const at = iso(r.createdAt) ?? "";
      const action = String(r.action ?? "?");
      let detail = "";
      if (r.detailsJson != null) {
        try {
          detail = JSON.stringify(r.detailsJson, null, 0);
        } catch {
          detail = String(r.detailsJson);
        }
      }
      out.push({
        id: `a-${id}`,
        at,
        tone: "audit",
        title: `অডিট: ${action}`,
        body: detail.length > 280 ? `${detail.slice(0, 280)}…` : detail || undefined,
      });
    }
  }

  out.sort((a, b) => {
    const ta = Date.parse(a.at) || 0;
    const tb = Date.parse(b.at) || 0;
    return tb - ta;
  });
  return out;
}

function toneVariant(t: TimelineEntry["tone"]): "default" | "success" | "warning" | "danger" | "info" {
  switch (t) {
    case "publish":
      return "success";
    case "review":
      return "info";
    case "status":
      return "warning";
    default:
      return "default";
  }
}

export function ServiceInstanceActivityTimeline(props: {
  statusLogs?: unknown;
  reviews?: unknown;
  publishLogs?: unknown;
  auditEvents?: unknown;
  className?: string;
}) {
  const entries = useMemo(
    () =>
      collectEntries({
        statusLogs: props.statusLogs,
        reviews: props.reviews,
        publishLogs: props.publishLogs,
        auditEvents: props.auditEvents,
      }),
    [props.statusLogs, props.reviews, props.publishLogs, props.auditEvents],
  );

  if (entries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-200 px-3 py-4 text-center text-sm text-zinc-500 dark:border-zinc-700">
        কোনো টাইমলাইন ইভেন্ট নেই।
      </p>
    );
  }

  return (
    <ol className={cn("relative space-y-0 border-l border-zinc-200 pl-4 dark:border-zinc-700", props.className)}>
      {entries.map((e) => (
        <li key={e.id} className="relative pb-6 last:pb-0">
          <span
            className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-600 dark:border-zinc-950"
            aria-hidden
          />
          <div className="flex flex-wrap items-start justify-between gap-2 pl-1">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <AdminBadge variant={toneVariant(e.tone)} className="text-[10px]">
                  {e.tone}
                </AdminBadge>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{e.title}</span>
              </div>
              <time className="block text-xs text-zinc-500" dateTime={e.at}>
                {formatWhen(e.at)}
              </time>
              {e.meta ? <p className="text-xs text-zinc-600 dark:text-zinc-400">{e.meta}</p> : null}
              {e.body ? (
                <p className="whitespace-pre-wrap break-words rounded-md bg-zinc-50 px-2 py-1.5 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                  {e.body}
                </p>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
