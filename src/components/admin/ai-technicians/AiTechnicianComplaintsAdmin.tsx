"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin-ui/AdminEmptyState";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AdminTable } from "@/components/admin-ui/AdminTable";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 25;

type ComplaintStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";

type ComplaintRow = {
  id: string;
  aiServiceRequestId: string | null;
  technicianProfileId: string;
  technicianDisplayName: string | null;
  category: string;
  message: string;
  status: ComplaintStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

function statusBn(s: ComplaintStatus): string {
  switch (s) {
    case "OPEN":
      return "খোলা";
    case "UNDER_REVIEW":
      return "পর্যালোচনাধীন";
    case "RESOLVED":
      return "নিষ্পত্তি";
    case "REJECTED":
      return "প্রত্যাখ্যান";
    default:
      return s;
  }
}

function statusBadgeVariant(
  s: ComplaintStatus,
): "warning" | "info" | "success" | "danger" | "default" {
  switch (s) {
    case "OPEN":
      return "warning";
    case "UNDER_REVIEW":
      return "info";
    case "RESOLVED":
      return "success";
    case "REJECTED":
      return "danger";
    default:
      return "default";
  }
}

const FILTER_TABS: { key: string; label: string; status?: ComplaintStatus }[] = [
  { key: "all", label: "সব" },
  { key: "open", label: "খোলা", status: "OPEN" },
  { key: "under", label: "পর্যালোচনা", status: "UNDER_REVIEW" },
  { key: "resolved", label: "নিষ্পত্তি", status: "RESOLVED" },
  { key: "rejected", label: "প্রত্যাখ্যান", status: "REJECTED" },
];

function inputClassName(): string {
  return cn(
    "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
    "outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2",
    "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  );
}

function ComplaintDetailForm({
  row,
  saving,
  onSave,
}: {
  row: ComplaintRow;
  saving: boolean;
  onSave: (status: ComplaintStatus, adminNote: string) => Promise<void>;
}) {
  const [editStatus, setEditStatus] = useState<ComplaintStatus>(row.status);
  const [editNote, setEditNote] = useState(row.adminNote ?? "");

  return (
    <AdminFormSection title="নির্বাচিত অভিযোগ" description="অবস্থা ও অ্যাডমিন নোট আপডেট করুন।">
      <div className="space-y-3 text-sm">
        <p className="whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
          {row.message}
        </p>
        {row.aiServiceRequestId ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            অনুরোধ আইডি:{" "}
            <code className="rounded bg-zinc-200 px-1 py-0.5 dark:bg-zinc-800">{row.aiServiceRequestId}</code>
          </p>
        ) : null}
        <label className="block">
          <span className="font-medium text-zinc-800 dark:text-zinc-100">নতুন অবস্থা</span>
          <select
            className={inputClassName()}
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as ComplaintStatus)}
            disabled={saving}
          >
            {(["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"] as const).map((s) => (
              <option key={s} value={s}>
                {statusBn(s)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-medium text-zinc-800 dark:text-zinc-100">অ্যাডমিন নোট (ঐচ্ছিক)</span>
          <textarea
            className={cn(inputClassName(), "min-h-[88px]")}
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            disabled={saving}
            maxLength={4000}
          />
        </label>
        <AdminActionButton
          variant="primary"
          disabled={saving}
          onClick={() => void onSave(editStatus, editNote)}
        >
          {saving ? "সংরক্ষণ…" : "সংরক্ষণ করুন"}
        </AdminActionButton>
      </div>
    </AdminFormSection>
  );
}

export function AiTechnicianComplaintsAdmin() {
  const [tab, setTab] = useState("all");
  const [rows, setRows] = useState<ComplaintRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selected = useMemo(
    () => (selectedId ? (rows.find((r) => r.id === selectedId) ?? null) : null),
    [rows, selectedId],
  );

  const statusParam = useMemo(() => {
    const t = FILTER_TABS.find((x) => x.key === tab);
    return t?.status;
  }, [tab]);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      if (statusParam) params.set("status", statusParam);

      const data = await readAdminJson<{
        complaints: ComplaintRow[];
        pagination: { total: number; hasMore: boolean };
      }>(await adminFetch(`/api/admin/ai-technician-complaints?${params}`));

      setRows(data.complaints);
      setTotal(data.pagination.total);
      setSelectedId((prev) => {
        if (!prev) return null;
        return data.complaints.some((r) => r.id === prev) ? prev : null;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "তালিকা লোড করা যায়নি");
      setRows([]);
      setTotal(0);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }, [offset, statusParam]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void loadList();
  }, [loadList]);

  const onSelect = (r: ComplaintRow) => {
    setSelectedId(r.id);
  };

  const onSave = async (status: ComplaintStatus, adminNote: string) => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await readAdminJson<{
        complaint: { id: string; status: ComplaintStatus; adminNote: string | null };
      }>(
        await adminFetch(`/api/admin/ai-technician-complaints/${selected.id}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            adminNote: adminNote.trim() || null,
          }),
        }),
      );
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "আপডেট ব্যর্থ");
    } finally {
      setSaving(false);
    }
  };

  const showInitialLoading = loading && rows.length === 0;
  const showEmpty = !loading && !error && rows.length === 0;
  const hasPrev = offset > 0;
  const hasNext = offset + rows.length < total;

  const toolbar = (
    <div className="flex flex-wrap gap-2">
      {FILTER_TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => {
            setTab(t.key);
            setOffset(0);
            setSelectedId(null);
          }}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium ring-1 transition",
            tab === t.key
              ? "bg-emerald-600 text-white ring-emerald-700"
              : "bg-zinc-100 text-zinc-800 ring-zinc-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6" lang="bn">
      <AdminPageHeader
        title="এআই টেকনিশিয়ান অভিযোগ"
        description="খামারিদের জমাকৃত অভিযোগ দেখুন ও অবস্থা আপডেট করুন।"
        actions={
          <AdminActionButton href="/admin/ai-technicians" variant="secondary">
            টেকনিশিয়ান তালিকা
          </AdminActionButton>
        }
      />

      {error ? <AdminErrorState message={error} onRetry={() => void loadList()} /> : null}

      {showInitialLoading ? (
        <AdminLoadingState message="লোড হচ্ছে…" />
      ) : showEmpty ? (
        <AdminEmptyState title="কোনো অভিযোগ নেই" description="এই ফিল্টারে কিছু পাওয়া যায়নি।" />
      ) : (
        <AdminFormSection title="অভিযোগ তালিকা" description={`মোট ${total}`}>
          <AdminTable toolbar={toolbar}>
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2">তারিখ</th>
                <th className="px-4 py-2">অবস্থা</th>
                <th className="px-4 py-2">বিভাগ</th>
                <th className="px-4 py-2">টেকনিশিয়ান</th>
                <th className="px-4 py-2">বার্তা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((r) => {
                const active = selected?.id === r.id;
                return (
                  <tr
                    key={r.id}
                    className={cn(
                      "cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40",
                      active ? "bg-emerald-50/60 dark:bg-emerald-950/25" : "",
                    )}
                    onClick={() => onSelect(r)}
                  >
                    <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                      {r.createdAt.slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="px-4 py-2">
                      <AdminBadge variant={statusBadgeVariant(r.status)}>{statusBn(r.status)}</AdminBadge>
                    </td>
                    <td className="px-4 py-2 font-medium text-zinc-900 dark:text-zinc-50">{r.category}</td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/admin/ai-technicians/${r.technicianProfileId}`}
                        className="text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        {r.technicianDisplayName?.trim() || r.technicianProfileId.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="max-w-md px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200">
                      <span className="line-clamp-2">{r.message}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </AdminTable>
        </AdminFormSection>
      )}

      {!showInitialLoading && !showEmpty && total > PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">
            মোট {total} · দেখানো {offset + 1}–{Math.min(offset + rows.length, total)}
          </span>
          <div className="flex gap-2">
            <AdminActionButton
              variant="secondary"
              disabled={!hasPrev || loading}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            >
              পূর্ববর্তী
            </AdminActionButton>
            <AdminActionButton
              variant="secondary"
              disabled={!hasNext || loading}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
            >
              পরবর্তী
            </AdminActionButton>
          </div>
        </div>
      ) : null}

      {selected ? (
        <ComplaintDetailForm
          key={`${selected.id}-${selected.updatedAt}`}
          row={selected}
          saving={saving}
          onSave={onSave}
        />
      ) : null}
    </div>
  );
}
