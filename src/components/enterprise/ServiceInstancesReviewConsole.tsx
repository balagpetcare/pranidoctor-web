"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { ServiceInstanceActionSheet } from "@/components/enterprise/ServiceInstanceActionSheet";
import type { ActionSheetMode } from "@/components/enterprise/ServiceInstanceActionSheet";
import { ServiceInstanceActivityTimeline } from "@/components/enterprise/ServiceInstanceActivityTimeline";
import { ServiceInstanceMediaGallery } from "@/components/enterprise/ServiceInstanceMediaGallery";
import { ServiceInstanceReviewTableSkeleton } from "@/components/enterprise/ServiceInstanceReviewTableSkeleton";
import { ServiceInstanceValidationPanel } from "@/components/enterprise/ServiceInstanceValidationPanel";
import { JsonDiffViewer } from "@/components/schema-form/JsonDiffViewer";
import { PraniSchemaRenderer } from "@/components/schema-form/PraniSchemaRenderer";
import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin-ui/AdminEmptyState";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AdminTable } from "@/components/admin-ui/AdminTable";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { cn } from "@/lib/cn";
import type { PraniSchemaDocument } from "@/lib/service-instances/semen-instance-schema.types";
import {
  ServiceInstanceStatuses,
  type ServiceInstanceStatus,
  UserRoles,
  type UserRole,
} from "@/lib/service-instances/service-instance-public.types";

type ListItem = {
  id: string;
  status: ServiceInstanceStatus;
  deploymentBranch: string | null;
  updatedAt: string;
  submittedAt: string | null;
  template: { id: string; internalName: string };
  technician: { id: string; displayName: string | null; userId: string };
};

const TABS: {
  key: string;
  labelBn: string;
  statuses?: string;
  single?: ServiceInstanceStatus;
}[] = [
  { key: "pending", labelBn: "অপেক্ষমাণ", statuses: "SUBMITTED,UNDER_REVIEW" },
  {
    key: "needs_correction",
    labelBn: "সংশোধন",
    single: ServiceInstanceStatuses.NEEDS_CORRECTION,
  },
  { key: "approved", labelBn: "অনুমোদিত", single: ServiceInstanceStatuses.APPROVED },
  { key: "published", labelBn: "প্রকাশিত", single: ServiceInstanceStatuses.PUBLISHED },
  { key: "archived", labelBn: "আর্কাইভ", single: ServiceInstanceStatuses.ARCHIVED },
  { key: "rejected", labelBn: "প্রত্যাখ্যাত", single: ServiceInstanceStatuses.REJECTED },
  { key: "draft", labelBn: "খসড়া", single: ServiceInstanceStatuses.DRAFT },
];

function statusVariant(
  s: ServiceInstanceStatus,
): "default" | "success" | "warning" | "danger" | "info" {
  switch (s) {
    case "PUBLISHED":
    case "APPROVED":
      return "success";
    case "UNDER_REVIEW":
    case "SUBMITTED":
      return "warning";
    case "REJECTED":
      return "danger";
    case "NEEDS_CORRECTION":
      return "info";
    default:
      return "default";
  }
}

function statusLabelBn(s: ServiceInstanceStatus): string {
  const map: Partial<Record<ServiceInstanceStatus, string>> = {
    DRAFT: "খসড়া",
    SUBMITTED: "জমা হয়েছে",
    UNDER_REVIEW: "পর্যালোচনাধীন",
    NEEDS_CORRECTION: "সংশোধন দরকার",
    APPROVED: "অনুমোদিত",
    REJECTED: "প্রত্যাখ্যাত",
    PUBLISHED: "প্রকাশিত",
    ARCHIVED: "আর্কাইভ",
  };
  return map[s] ?? s;
}

type SheetState = {
  key: string;
  mode: ActionSheetMode;
  run: (note: string) => Promise<void>;
};

const InstanceTableRow = memo(function InstanceTableRow({
  row,
  onSelect,
}: {
  row: ListItem;
  onSelect: (id: string) => void;
}) {
  return (
    <tr
      className="cursor-pointer border-t border-zinc-100 [content-visibility:auto] hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
      onClick={() => onSelect(row.id)}
    >
      <td className="px-3 py-2.5 font-mono text-xs">{row.id.slice(0, 8)}…</td>
      <td className="px-3 py-2.5 text-sm">{row.template.internalName}</td>
      <td className="px-3 py-2.5 text-sm">{row.technician.displayName ?? "—"}</td>
      <td className="px-3 py-2.5">
        <AdminBadge variant={statusVariant(row.status)}>{statusLabelBn(row.status)}</AdminBadge>
      </td>
      <td className="px-3 py-2.5 text-xs text-zinc-600 dark:text-zinc-400">
        {new Date(row.updatedAt).toLocaleString("bn-BD", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </td>
    </tr>
  );
});

function CollapsibleSection(props: {
  title: string;
  defaultOpen?: boolean;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <details
      className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950"
      open={props.defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-semibold text-zinc-900 marker:content-none dark:text-zinc-50 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 transition group-open:bg-emerald-600"
            aria-hidden
          />
          <span className="truncate">{props.title}</span>
          {props.badge ? <span className="shrink-0">{props.badge}</span> : null}
        </span>
        <span className="shrink-0 text-xs font-normal text-zinc-500 transition group-open:rotate-180" aria-hidden>
          ▼
        </span>
      </summary>
      <div className="border-t border-zinc-100 px-3 py-3 dark:border-zinc-800">{props.children}</div>
    </details>
  );
}

export function ServiceInstancesReviewConsole(props?: { initialTab?: string }) {
  const initial = props?.initialTab;
  const [tab, setTab] = useState(
    initial && TABS.some((t) => t.key === initial) ? initial! : "pending",
  );
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [branch, setBranch] = useState("main");
  const [items, setItems] = useState<ListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actorRole, setActorRole] = useState<UserRole | null>(null);

  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    instance: Record<string, unknown>;
    schema: PraniSchemaDocument;
    mergedValues: Record<string, unknown>;
    mediaPreviews: { id: string; kind: string; signedUrl: string | null }[];
  } | null>(null);

  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [sheetBusy, setSheetBusy] = useState(false);

  const openActionSheet = useCallback((payload: Omit<SheetState, "key">) => {
    setSheet({ ...payload, key: globalThis.crypto.randomUUID() });
  }, []);

  const tabDef = useMemo(() => TABS.find((t) => t.key === tab), [tab]);

  useEffect(() => {
    if (initial && TABS.some((t) => t.key === initial)) {
      startTransition(() => setTab(initial));
    }
  }, [initial]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await adminFetch("/api/admin/auth/me");
        const data = await readAdminJson<{ user: { role: UserRole } }>(res);
        setActorRole(data.user.role);
      } catch {
        setActorRole(null);
      }
    })();
  }, []);

  useEffect(() => {
    if (!drawerId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerId]);

  const loadList = useCallback(async () => {
    setListLoading(true);
    setError(null);
    setNextCursor(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", "30");
      params.set("deploymentBranch", branch);
      if (appliedQ.trim()) params.set("q", appliedQ.trim());
      if (tabDef?.statuses) params.set("statuses", tabDef.statuses);
      else if (tabDef?.single) params.set("status", tabDef.single);

      const res = await adminFetch(`/api/admin/service-instances?${params}`);
      const data = await readAdminJson<{
        items: ListItem[];
        nextCursor: string | null;
      }>(res);
      setItems(data.items);
      setNextCursor(data.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "লোড ব্যর্থ");
    } finally {
      setListLoading(false);
    }
  }, [appliedQ, branch, tabDef]);

  useEffect(() => {
    startTransition(() => {
      void loadList();
    });
  }, [loadList]);

  const loadMore = useCallback(async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", "30");
      params.set("cursor", nextCursor);
      params.set("deploymentBranch", branch);
      if (appliedQ.trim()) params.set("q", appliedQ.trim());
      if (tabDef?.statuses) params.set("statuses", tabDef.statuses);
      else if (tabDef?.single) params.set("status", tabDef.single);
      const res = await adminFetch(`/api/admin/service-instances?${params}`);
      const data = await readAdminJson<{
        items: ListItem[];
        nextCursor: string | null;
      }>(res);
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "লোড ব্যর্থ");
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, branch, appliedQ, tabDef]);

  const openDetail = useCallback(
    async (id: string) => {
      setDrawerId(id);
      setDetail(null);
      setDetailError(null);
      setDetailLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("deploymentBranch", branch);
        const res = await adminFetch(`/api/admin/service-instances/${id}?${params.toString()}`);
        const data = await readAdminJson<{
          instance: Record<string, unknown>;
          schema: PraniSchemaDocument;
          mergedValues: Record<string, unknown>;
          mediaPreviews: { id: string; kind: string; signedUrl: string | null }[];
        }>(res);
        setDetail(data);
      } catch (e) {
        setDetailError(e instanceof Error ? e.message : "বিস্তারিত লোড ব্যর্থ");
      } finally {
        setDetailLoading(false);
      }
    },
    [branch],
  );

  const refreshDrawerAndList = useCallback(async () => {
    await loadList();
    if (drawerId) await openDetail(drawerId);
  }, [loadList, openDetail, drawerId]);

  const runPatchStatus = useCallback(
    async (id: string, toStatus: ServiceInstanceStatus, reason?: string) => {
      const res = await adminFetch(
        `/api/admin/service-instances/${id}/status?deploymentBranch=${encodeURIComponent(branch)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toStatus, reason: reason || undefined }),
        },
      );
      await readAdminJson(res);
    },
    [branch],
  );

  const runPostReview = useCallback(
    async (
      id: string,
      decision: "APPROVE" | "REJECT" | "REQUEST_CORRECTION" | "COMMENT",
      body: string,
    ) => {
      const res = await adminFetch(
        `/api/admin/service-instances/${id}/review?deploymentBranch=${encodeURIComponent(branch)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision, body }),
        },
      );
      await readAdminJson(res);
    },
    [branch],
  );

  const runPublish = useCallback(
    async (id: string, action: "PUBLISH" | "ROLLBACK" | "UNPUBLISH") => {
      const res = await adminFetch(
        `/api/admin/service-instances/${id}/publish?deploymentBranch=${encodeURIComponent(branch)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        },
      );
      await readAdminJson(res);
    },
    [branch],
  );

  const handleSheetSubmit = useCallback(
    async (note: string) => {
      const current = sheet;
      if (!current) return;
      setSheetBusy(true);
      try {
        await current.run(note);
        toast.success("সম্পন্ন হয়েছে");
        setSheet(null);
        await refreshDrawerAndList();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "অপারেশন ব্যর্থ");
      } finally {
        setSheetBusy(false);
      }
    },
    [sheet, refreshDrawerAndList],
  );

  const onRowSelect = useCallback(
    (id: string) => {
      void openDetail(id);
    },
    [openDetail],
  );

  const inst = detail?.instance as
    | {
        status?: ServiceInstanceStatus;
        payloadJson?: unknown;
        lockedSnapshotJson?: unknown;
        validationResultJson?: unknown;
        statusLogs?: unknown[];
        reviews?: unknown[];
        publishLogs?: unknown[];
        auditEvents?: unknown[];
      }
    | undefined;

  const canPublish = actorRole === UserRoles.SUPER_ADMIN;

  return (
    <div className="space-y-5 sm:space-y-6">
      <AdminPageHeader
        title="সেবা ইনস্ট্যান্স পর্যালোচনা"
        description="Enterprise semen টেমপ্লেট জমা — অপেক্ষমাণ সারি, পর্যালোচনা ও প্রকাশ"
      />

      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm transition",
              tab === t.key
                ? "bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800/30"
                : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
            )}
            onClick={() => setTab(t.key)}
          >
            {t.labelBn}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] lg:items-end">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
            ডিপ্লয়মেন্ট শাখা
          </span>
          <input
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-zinc-600 dark:bg-zinc-950"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            autoComplete="off"
          />
        </label>
        <label className="text-sm sm:col-span-2 lg:col-span-1">
          <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
            খোঁজ (টেমপ্লেট / টেকনিশিয়ান)
          </span>
          <input
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-zinc-600 dark:bg-zinc-950"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setAppliedQ(q);
            }}
            placeholder="লিখে এন্টার বা প্রয়োগ"
          />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-1 lg:justify-end">
          <AdminActionButton variant="secondary" onClick={() => setAppliedQ(q)}>
            খোঁজ প্রয়োগ
          </AdminActionButton>
          {appliedQ ? (
            <AdminActionButton
              variant="secondary"
              onClick={() => {
                setQ("");
                setAppliedQ("");
              }}
            >
              খোঁজ মুছুন
            </AdminActionButton>
          ) : null}
        </div>
      </div>

      {error ? <AdminErrorState message={error} /> : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-[var(--pd-admin-surface,white)] dark:border-zinc-800">
        {listLoading && items.length === 0 ? (
          <ServiceInstanceReviewTableSkeleton rows={10} />
        ) : !listLoading && items.length === 0 ? (
          <div className="p-4">
            <AdminEmptyState title="কোনো রেকর্ড নেই" />
          </div>
        ) : (
          <AdminTable>
            <thead>
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  আইডি
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  টেমপ্লেট
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  টেকনিশিয়ান
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  অবস্থা
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  আপডেট
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <InstanceTableRow key={r.id} row={r} onSelect={onRowSelect} />
              ))}
            </tbody>
          </AdminTable>
        )}
      </div>

      {nextCursor ? (
        <div className="flex flex-wrap items-center gap-3">
          <AdminActionButton
            variant="secondary"
            disabled={loadingMore}
            onClick={() => void loadMore()}
          >
            {loadingMore ? "লোড হচ্ছে…" : "আরও লোড"}
          </AdminActionButton>
        </div>
      ) : null}

      {drawerId ? (
        <div
          className="fixed inset-0 z-[100] flex justify-end bg-black/45 backdrop-blur-[2px] transition-opacity"
          role="presentation"
          onClick={() => setDrawerId(null)}
        >
          <aside
            className={cn(
              "pd-enterprise-drawer-panel flex h-full w-full max-w-full flex-col border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:max-w-lg lg:max-w-2xl",
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pd-enterprise-drawer-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="sticky top-0 z-[1] flex items-start justify-between gap-3 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
              <div className="min-w-0">
                <h2 id="pd-enterprise-drawer-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  বিস্তারিত
                </h2>
                <p className="mt-0.5 truncate font-mono text-xs text-zinc-500">{drawerId}</p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-zinc-200 px-2.5 py-1 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                onClick={() => setDrawerId(null)}
              >
                বন্ধ
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {detailLoading ? (
                <AdminLoadingState message="বিস্তারিত লোড হচ্ছে…" />
              ) : null}
              {detailError ? <AdminErrorState message={detailError} /> : null}
              {detail && inst ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminBadge variant={statusVariant(inst.status!)}>
                      {statusLabelBn(inst.status!)}
                    </AdminBadge>
                    <span className="text-xs text-zinc-500">শাখা: {branch}</span>
                  </div>

                  <CollapsibleSection title="স্কিমা ভিউ (টেমপ্লেট + পেলোড)" defaultOpen>
                    <PraniSchemaRenderer schema={detail.schema} values={detail.mergedValues} mode="read" />
                  </CollapsibleSection>

                  <CollapsibleSection title="মিডিয়া গ্যালারি" defaultOpen>
                    <ServiceInstanceMediaGallery items={detail.mediaPreviews} />
                  </CollapsibleSection>

                  <CollapsibleSection title="ডিফ: লক স্ন্যাপশট বনাম বর্তমান পেলোড">
                    <JsonDiffViewer
                      leftLabel="জমার স্ন্যাপশট"
                      rightLabel="বর্তমান পেলোড"
                      left={inst.lockedSnapshotJson ?? {}}
                      right={inst.payloadJson ?? {}}
                    />
                  </CollapsibleSection>

                  <CollapsibleSection title="যাচাইকরণ ফলাফল" defaultOpen>
                    <ServiceInstanceValidationPanel validationResultJson={inst.validationResultJson} />
                  </CollapsibleSection>

                  <CollapsibleSection title="অডিট ও টাইমলাইন" defaultOpen>
                    <ServiceInstanceActivityTimeline
                      statusLogs={inst.statusLogs}
                      reviews={inst.reviews}
                      publishLogs={inst.publishLogs}
                      auditEvents={inst.auditEvents}
                    />
                  </CollapsibleSection>

                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
                    পর্যালোচনা নোট ও কারণগুলো নিচের বোতামে দিয়ে জমা দিন। অবৈধ স্টেট ট্রানজিশন হলে সার্ভার বার্তা দেখাবে।
                  </div>
                </div>
              ) : null}
            </div>

            {detail && inst && !detailLoading ? (
              <footer className="sticky bottom-0 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
                <div className="mb-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">কর্ম</div>
                <div className="flex max-h-[40vh] flex-wrap gap-2 overflow-y-auto">
                  <AdminActionButton
                    variant="secondary"
                    onClick={() => {
                      if (!drawerId) return;
                      openActionSheet({
                        mode: {
                          kind: "confirm",
                          title: "পর্যালোচনায় নিন",
                          description:
                            "বৈধ হলে ইনস্ট্যান্সের অবস্থা পর্যালোচনাধীন (UNDER_REVIEW) করা হবে।",
                          confirmLabel: "নিশ্চিত",
                        },
                        run: async () => {
                          await runPatchStatus(drawerId, "UNDER_REVIEW");
                        },
                      });
                    }}
                  >
                    পর্যালোচনায় নিন
                  </AdminActionButton>
                  <AdminActionButton
                    variant="primary"
                    onClick={() => {
                      if (!drawerId) return;
                      openActionSheet({
                        mode: {
                          kind: "note",
                          title: "অনুমোদন",
                          noteLabel: "পর্যালোচনা নোট (বাধ্যতামূলক)",
                          noteRequired: true,
                          confirmLabel: "অনুমোদন জমা",
                        },
                        run: async (body) => {
                          await runPostReview(drawerId, "APPROVE", body);
                        },
                      });
                    }}
                  >
                    অনুমোদন
                  </AdminActionButton>
                  <AdminActionButton
                    variant="danger"
                    onClick={() => {
                      if (!drawerId) return;
                      openActionSheet({
                        mode: {
                          kind: "note",
                          title: "প্রত্যাখ্যান",
                          noteLabel: "কারণ (বাধ্যতামূলক)",
                          noteRequired: true,
                          confirmLabel: "প্রত্যাখ্যান জমা",
                          danger: true,
                        },
                        run: async (body) => {
                          await runPostReview(drawerId, "REJECT", body);
                        },
                      });
                    }}
                  >
                    প্রত্যাখ্যান
                  </AdminActionButton>
                  <AdminActionButton
                    variant="secondary"
                    onClick={() => {
                      if (!drawerId) return;
                      openActionSheet({
                        mode: {
                          kind: "note",
                          title: "সংশোধন চাওয়া",
                          noteLabel: "কী সংশোধন দরকার (বাধ্যতামূলক)",
                          noteRequired: true,
                          confirmLabel: "অনুরোধ জমা",
                        },
                        run: async (body) => {
                          await runPostReview(drawerId, "REQUEST_CORRECTION", body);
                        },
                      });
                    }}
                  >
                    সংশোধন চান
                  </AdminActionButton>
                  <AdminActionButton
                    variant="secondary"
                    onClick={() => {
                      if (!drawerId) return;
                      openActionSheet({
                        mode: {
                          kind: "note",
                          title: "অভ্যন্তরীণ মন্তব্য",
                          noteLabel: "মন্তব্য (বাধ্যতামূলক)",
                          noteRequired: true,
                          confirmLabel: "মন্তব্য জমা",
                        },
                        run: async (body) => {
                          await runPostReview(drawerId, "COMMENT", body);
                        },
                      });
                    }}
                  >
                    মন্তব্য
                  </AdminActionButton>
                  <AdminActionButton
                    variant="secondary"
                    onClick={() => {
                      if (!drawerId) return;
                      openActionSheet({
                        mode: {
                          kind: "confirm",
                          title: "আর্কাইভ",
                          description: "বৈধ হলে ইনস্ট্যান্স আর্কাইভ করা হবে।",
                          confirmLabel: "আর্কাইভ করুন",
                          danger: true,
                        },
                        run: async () => {
                          await runPatchStatus(drawerId, "ARCHIVED");
                        },
                      });
                    }}
                  >
                    আর্কাইভ
                  </AdminActionButton>
                </div>

                {canPublish ? (
                  <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                    <div className="mb-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      সুপার অ্যাডমিন — প্রকাশ নিয়ন্ত্রণ
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AdminActionButton
                        variant="primary"
                        onClick={() => {
                          if (!drawerId) return;
                          openActionSheet({
                            mode: {
                              kind: "confirm",
                              title: "প্রকাশ",
                              description:
                                "অনুমোদিত ইনস্ট্যান্স লাইভ তালিকায় প্রকাশ হবে (সার্ভার নিয়ম অনুযায়ী)।",
                              confirmLabel: "প্রকাশ করুন",
                            },
                            run: async () => {
                              await runPublish(drawerId, "PUBLISH");
                            },
                          });
                        }}
                      >
                        প্রকাশ
                      </AdminActionButton>
                      <AdminActionButton
                        variant="secondary"
                        onClick={() => {
                          if (!drawerId) return;
                          openActionSheet({
                            mode: {
                              kind: "confirm",
                              title: "রোলব্যাক",
                              description: "প্রকাশিত সেবা পূর্ববর্তী অবস্থায় ফিরিয়ে আনার চেষ্টা।",
                              confirmLabel: "রোলব্যাক",
                              danger: true,
                            },
                            run: async () => {
                              await runPublish(drawerId, "ROLLBACK");
                            },
                          });
                        }}
                      >
                        রোলব্যাক
                      </AdminActionButton>
                      <AdminActionButton
                        variant="danger"
                        onClick={() => {
                          if (!drawerId) return;
                          openActionSheet({
                            mode: {
                              kind: "confirm",
                              title: "আনপ্রকাশ / আর্কাইভ",
                              description: "প্রকাশ সরিয়ে আর্কাইভ করার চেষ্টা।",
                              confirmLabel: "নিশ্চিত করুন",
                              danger: true,
                            },
                            run: async () => {
                              await runPublish(drawerId, "UNPUBLISH");
                            },
                          });
                        }}
                      >
                        আনপ্রকাশ
                      </AdminActionButton>
                    </div>
                  </div>
                ) : null}
              </footer>
            ) : null}
          </aside>
        </div>
      ) : null}

      <ServiceInstanceActionSheet
        key={sheet?.key ?? "closed"}
        open={sheet !== null}
        mode={sheet?.mode ?? null}
        busy={sheetBusy}
        onClose={() => {
          if (!sheetBusy) setSheet(null);
        }}
        onSubmit={handleSheetSubmit}
      />
    </div>
  );
}
