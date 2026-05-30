"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import {
  applicationStatusBadgeVariant,
  applicationStatusBn,
} from "./application-labels";
import {
  AI_TECHNICIAN_STATUS,
  type AiTechnicianApplicationStatus,
} from "./ai-technician-status-constants";
import {
  providerStatusBadgeVariant,
  providerStatusBn,
  userStatusBadgeVariant,
  userStatusBn,
} from "./technician-labels";

const DOC_TYPE_BN: Record<string, string> = {
  NID_FRONT: "এনআইডি (সামনে)",
  NID_BACK: "এনআইডি (পিছনে)",
  PROFILE_PHOTO: "প্রোফাইল ছবি",
  TRAINING_CERTIFICATE: "প্রশিক্ষণ সার্টিফিকেট",
  AI_CERTIFICATE: "কৃত্রিম প্রজনন সার্টিফিকেট",
  COMPANY_ID: "কোম্পানি পরিচয়পত্র",
  EXPERIENCE_PROOF: "অভিজ্ঞতার প্রমাণ",
  OTHER: "অন্যান্য নথি",
};

const DOC_REVIEW_BN: Record<string, string> = {
  PENDING_REVIEW: "পর্যালোচনা অপেক্ষমাণ",
  APPROVED: "অনুমোদিত",
  REJECTED: "প্রত্যাখ্যাত",
};

function docTypeBn(type: string): string {
  return DOC_TYPE_BN[type] ?? type;
}

function docReviewBn(status: string): string {
  return DOC_REVIEW_BN[status] ?? status;
}

function docReviewBadgeVariant(status: string): "default" | "success" | "warning" | "danger" {
  switch (status) {
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "danger";
    case "PENDING_REVIEW":
    default:
      return "warning";
  }
}

type UploadedFileMeta = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  fileCategory: string;
  createdAt: string;
};

type DocumentRow = {
  id: string;
  type: string;
  title: string;
  fileUrl: string | null;
  storageKey: string | null;
  mimeType: string | null;
  uploadedFileId: string | null;
  reviewStatus: string;
  uploadedAt: string;
  uploadedFile: UploadedFileMeta | null;
};

type AreaRow = {
  id: string;
  district: string;
  upazila: string;
  unionOrArea: string | null;
  districtId: string | null;
  upazilaId: string | null;
  unionId: string | null;
  isActive: boolean;
  createdAt: string;
};

type TechnicianApplicationDetail = {
  id: string;
  applicationStatus: AiTechnicianApplicationStatus;
  displayName: string | null;
  nidNumber: string | null;
  districtId: string | null;
  upazilaId: string | null;
  unionId: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  presentAddress: string | null;
  district: string | null;
  upazila: string | null;
  unionOrArea: string | null;
  experienceYears: number | null;
  trainingProvider: string | null;
  certificateNumber: string | null;
  certification: string | null;
  bio: string | null;
  serviceFeeBdt: string | null;
  acceptsEmergency: boolean;
  providerStatus: string;
  verifiedAt: string | null;
  adminNote: string | null;
  correctionNote: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  reviewedBy: { id: string; email: string; displayName: string | null } | null;
  documents: DocumentRow[];
  divisionCoverageAreas: AreaRow[];
  statusHistoryNote: string;
  user: {
    id: string;
    email: string;
    phone: string | null;
    role: string;
    status: string;
  };
  workingAreas: unknown[];
  villageServiceAreas: unknown[];
  serviceCategories: unknown[];
};

function docResolvedMime(d: DocumentRow): string | null {
  const m = d.uploadedFile?.mimeType?.trim() || d.mimeType?.trim();
  return m || null;
}

function documentAccessHref(d: DocumentRow): string | null {
  if (d.uploadedFileId) {
    return `/api/admin/uploads/${d.uploadedFileId}`;
  }
  const u = d.fileUrl?.trim();
  if (u && (u.startsWith("http://") || u.startsWith("https://"))) {
    return u;
  }
  return null;
}

function isSafeDownloadMime(mime: string | null): boolean {
  if (!mime) return false;
  const m = mime.toLowerCase();
  if (m.startsWith("image/")) return true;
  if (m === "application/pdf") return true;
  return false;
}

function isImageMime(mime: string | null): boolean {
  return Boolean(mime && mime.toLowerCase().startsWith("image/"));
}

function isPdfMime(mime: string | null): boolean {
  return mime?.toLowerCase() === "application/pdf";
}

function formatBytesShort(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function displayFileName(d: DocumentRow): string {
  return d.uploadedFile?.originalName?.trim() || d.title || "—";
}

function hasDocWithAccess(docs: DocumentRow[], docType: string): boolean {
  return docs.some((d) => d.type === docType && documentAccessHref(d) != null);
}

function nonEmpty(s: string | null | undefined): boolean {
  return Boolean(s?.trim());
}

type ActionDialogConfig = {
  action: string;
  title: string;
  message: string;
  /** Primary note (correction request / reject reason) — maps to `note` in API. */
  primaryNoteRequired: boolean;
  primaryNoteLabel: string;
  /** Optional second note for `adminNote` (approve / request_correction). */
  showOptionalAdminNote: boolean;
};

async function postTransition(
  id: string,
  body: Record<string, unknown>,
): Promise<{ technician: TechnicianApplicationDetail }> {
  return readAdminJson<{ technician: TechnicianApplicationDetail }>(
    await adminFetch(`/api/admin/ai-technician-applications/${id}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export function ApplicationReviewPanel({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const previewTitleId = useId();
  const actionTitleId = useId();
  const actionDescId = useId();
  const [row, setRow] = useState<TechnicianApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);
  const [retry, setRetry] = useState(0);
  const [actionDialog, setActionDialog] = useState<ActionDialogConfig | null>(null);
  const [dialogPrimaryNote, setDialogPrimaryNote] = useState("");
  const [dialogAdminNote, setDialogAdminNote] = useState("");
  const [preview, setPreview] = useState<{
    href: string;
    title: string;
    mime: string | null;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{ technician: TechnicianApplicationDetail }>(
        await adminFetch(`/api/admin/ai-technician-applications/${applicationId}`),
      );
      setRow(data.technician);
    } catch (e) {
      setError(e instanceof Error ? e.message : "লোড ব্যর্থ");
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
     
    void load();
  }, [load, retry]);

  useEffect(() => {
    if (!preview && !actionDialog) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        setPreview(null);
        setActionDialog(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview, actionDialog]);

  function openActionDialog(cfg: ActionDialogConfig) {
    setDialogPrimaryNote("");
    setDialogAdminNote("");
    setActionDialog(cfg);
  }

  async function submitActionDialog() {
    if (!actionDialog) return;
    if (actionDialog.primaryNoteRequired && !dialogPrimaryNote.trim()) {
      setError("নোট পূরণ করুন।");
      return;
    }
    setMutating(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = { action: actionDialog.action };
      const p = dialogPrimaryNote.trim();
      const a = dialogAdminNote.trim();
      if (p) payload.note = p;
      if (a) payload.adminNote = a;
      const data = await postTransition(applicationId, payload);
      setRow(data.technician);
      setActionDialog(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "কাজ ব্যর্থ");
    } finally {
      setMutating(false);
    }
  }

  if (loading) {
    return <AdminLoadingState message="আবেদন লোড হচ্ছে…" />;
  }

  if (error && !row) {
    return (
      <div className="space-y-4">
        <AdminErrorState message={error} onRetry={() => setRetry((k) => k + 1)} />
        <AdminActionButton href="/admin/ai-technicians/applications" variant="secondary">
          ← আবেদন তালিকা
        </AdminActionButton>
      </div>
    );
  }

  if (!row) return null;

  const st = row.applicationStatus;
  const activeServiceAreas = row.divisionCoverageAreas.filter((a) => a.isActive);
  const hasNidFront = hasDocWithAccess(row.documents, "NID_FRONT");
  const hasNidBack = hasDocWithAccess(row.documents, "NID_BACK");
  const profileCoreOk =
    nonEmpty(row.displayName) &&
    nonEmpty(row.nidNumber) &&
    nonEmpty(row.presentAddress) &&
    nonEmpty(row.district) &&
    nonEmpty(row.upazila);
  const hasServiceArea = activeServiceAreas.length > 0;
  const missingRequiredDocs = !hasNidFront || !hasNidBack;

  const profilePhotoDoc = row.documents.find((d) => d.type === "PROFILE_PHOTO");
  const profilePhotoHref = profilePhotoDoc ? documentAccessHref(profilePhotoDoc) : null;
  const profilePhotoMime = profilePhotoDoc ? docResolvedMime(profilePhotoDoc) : null;

  return (
    <div className="space-y-8" lang="bn">
      {preview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={() => setPreview(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={previewTitleId}
            className="max-h-[90vh] max-w-4xl overflow-auto rounded-[var(--pd-admin-radius)] border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 id={previewTitleId} className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {preview.title}
                </h2>
                <p className="text-xs text-zinc-500">{preview.mime ?? "—"}</p>
              </div>
              <AdminActionButton variant="secondary" type="button" onClick={() => setPreview(null)}>
                বন্ধ
              </AdminActionButton>
            </div>
            {preview.mime && isImageMime(preview.mime) ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin preview of user-uploaded images via protected same-origin URL
              <img
                src={preview.href}
                alt=""
                className="max-h-[75vh] w-auto max-w-full rounded-md object-contain"
              />
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                এই ধরনের ফাইলের জন্য নতুন ট্যাবে খুলুন।
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <AdminActionButton variant="secondary" href={preview.href} target="_blank" rel="noreferrer">
                নতুন ট্যাবে খুলুন
              </AdminActionButton>
            </div>
          </div>
        </div>
      ) : null}

      {actionDialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => !mutating && setActionDialog(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={actionTitleId}
            aria-describedby={actionDescId}
            className="w-full max-w-lg rounded-[var(--pd-admin-radius)] border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={actionTitleId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {actionDialog.title}
            </h2>
            <p id={actionDescId} className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {actionDialog.message}
            </p>
            {actionDialog.primaryNoteRequired ? (
              <label className="mt-4 block">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {actionDialog.primaryNoteLabel}
                </span>
                <textarea
                  value={dialogPrimaryNote}
                  onChange={(e) => setDialogPrimaryNote(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-[var(--pd-admin-radius-sm,0.5rem)] border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                  placeholder="বিস্তারিত লিখুন…"
                />
              </label>
            ) : null}
            {actionDialog.showOptionalAdminNote ? (
              <label className="mt-3 block">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  অ্যাডমিন নোট (ঐচ্ছিক)
                </span>
                <textarea
                  value={dialogAdminNote}
                  onChange={(e) => setDialogAdminNote(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-[var(--pd-admin-radius-sm,0.5rem)] border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
            ) : null}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <AdminActionButton
                variant="secondary"
                type="button"
                disabled={mutating}
                onClick={() => setActionDialog(null)}
              >
                বাতিল
              </AdminActionButton>
              <AdminActionButton
                variant="primary"
                type="button"
                disabled={mutating}
                onClick={() => void submitActionDialog()}
              >
                নিশ্চিত করুন
              </AdminActionButton>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div
          className="rounded-[var(--pd-admin-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          {error}
        </div>
      ) : null}

      <AdminFormSection
        title="প্রোফাইল সারাংশ"
        description="আবেদনকারীর মূল তথ্য ও অবস্থা।"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[var(--pd-admin-radius-sm,0.5rem)] border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
            {profilePhotoHref && profilePhotoMime && isImageMime(profilePhotoMime) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profilePhotoHref} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="px-2 text-center text-xs text-zinc-500">ছবি নেই</span>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {row.displayName ?? "—"}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {row.user.email} · {row.user.phone ?? "ফোন নেই"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AdminBadge variant={userStatusBadgeVariant(row.user.status)}>
                অ্যাকাউন্ট: {userStatusBn(row.user.status)}
              </AdminBadge>
              <AdminBadge variant="neutral">ভূমিকা: {row.user.role}</AdminBadge>
              <AdminBadge variant={applicationStatusBadgeVariant(st)}>
                আবেদন: {applicationStatusBn(st)}
              </AdminBadge>
              <AdminBadge variant={providerStatusBadgeVariant(row.providerStatus)}>
                প্রোভাইডার: {providerStatusBn(row.providerStatus)}
              </AdminBadge>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">সেবামূল্য (৳)</dt>
                <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{row.serviceFeeBdt ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">জরুরি সেবা</dt>
                <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                  {row.acceptsEmergency ? "হ্যাঁ" : "না"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">সার্টিফিকেশন</dt>
                <dd className="mt-0.5 text-zinc-800 dark:text-zinc-200">{row.certification ?? "—"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </AdminFormSection>

      <AdminFormSection title="যাচাইকরণ চেকলিস্ট" description="আবেদন সম্পূর্ণ কিনা দ্রুত দেখুন।">
        <ul className="grid gap-2 sm:grid-cols-2">
          <li className="flex items-center justify-between gap-2 rounded-[var(--pd-admin-radius-sm,0.5rem)] border border-zinc-200 px-3 py-2 dark:border-zinc-700">
            <span className="text-sm text-zinc-800 dark:text-zinc-200">এনআইডি সামনের দিক</span>
            <AdminBadge variant={hasNidFront ? "success" : "warning"}>
              {hasNidFront ? "আপলোড হয়েছে" : "নেই"}
            </AdminBadge>
          </li>
          <li className="flex items-center justify-between gap-2 rounded-[var(--pd-admin-radius-sm,0.5rem)] border border-zinc-200 px-3 py-2 dark:border-zinc-700">
            <span className="text-sm text-zinc-800 dark:text-zinc-200">এনআইডি পিছনের দিক</span>
            <AdminBadge variant={hasNidBack ? "success" : "warning"}>
              {hasNidBack ? "আপলোড হয়েছে" : "নেই"}
            </AdminBadge>
          </li>
          <li className="flex items-center justify-between gap-2 rounded-[var(--pd-admin-radius-sm,0.5rem)] border border-zinc-200 px-3 py-2 dark:border-zinc-700">
            <span className="text-sm text-zinc-800 dark:text-zinc-200">কমপক্ষে একটি সক্রিয় সেবা এলাকা</span>
            <AdminBadge variant={hasServiceArea ? "success" : "warning"}>
              {hasServiceArea ? `${activeServiceAreas.length}টি` : "নেই"}
            </AdminBadge>
          </li>
          <li className="flex items-center justify-between gap-2 rounded-[var(--pd-admin-radius-sm,0.5rem)] border border-zinc-200 px-3 py-2 dark:border-zinc-700">
            <span className="text-sm text-zinc-800 dark:text-zinc-200">প্রয়োজনীয় প্রোফাইল ক্ষেত্র</span>
            <AdminBadge variant={profileCoreOk ? "success" : "warning"}>
              {profileCoreOk ? "সম্পূর্ণ" : "অসম্পূর্ণ"}
            </AdminBadge>
          </li>
        </ul>
      </AdminFormSection>

      {missingRequiredDocs || !hasServiceArea || !profileCoreOk ? (
        <div
          className="rounded-[var(--pd-admin-radius)] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-50"
          role="status"
        >
          <p className="font-medium">মনোযোগ: প্রয়োজনীয় তথ্য বা নথি অনুপস্থিত</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {!hasNidFront ? <li>এনআইডি (সামনে) আপলোড নেই বা ফাইল খোলা যাচ্ছে না।</li> : null}
            {!hasNidBack ? <li>এনআইডি (পিছনে) আপলোড নেই বা ফাইল খোলা যাচ্ছে না।</li> : null}
            {!hasServiceArea ? <li>কোনো সক্রিয় সেবা এলাকা নির্বাচিত নেই।</li> : null}
            {!profileCoreOk ? (
              <li>নাম, এনআইডি নম্বর, ঠিকানা বা জেলা/উপজেলা তথ্য অসম্পূর্ণ।</li>
            ) : null}
          </ul>
        </div>
      ) : null}

      <AdminFormSection title="আবেদনকারী (যোগাযোগ)" description="অ্যাকাউন্ট ও যোগাযোগ।">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {row.user.email} · {row.user.phone ?? "ফোন নেই"}
        </p>
      </AdminFormSection>

      <AdminFormSection title="ব্যক্তিগত তথ্য" description="ঠিকানা ও পরিচয়।">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">এনআইডি</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{row.nidNumber ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">জন্মতারিখ</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {row.dateOfBirth ? format(new Date(row.dateOfBirth), "PP") : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">লিঙ্গ</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{row.gender ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">ঠিকানা</dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
              {row.presentAddress ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">জেলা / উপজেলা</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {[row.district, row.upazila].filter(Boolean).join(" · ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">ইউনিয়ন / এলাকা</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{row.unionOrArea ?? "—"}</dd>
          </div>
          {(row.districtId || row.upazilaId || row.unionId) && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">লোকেশন আইডি</dt>
              <dd className="mt-0.5 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                জেলা: {row.districtId ?? "—"} · উপজেলা: {row.upazilaId ?? "—"} · ইউনিয়ন:{" "}
                {row.unionId ?? "—"}
              </dd>
            </div>
          )}
        </dl>
      </AdminFormSection>

      <AdminFormSection title="পেশাগত তথ্য" description="অভিজ্ঞতা ও সার্টিফিকেট।">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">অভিজ্ঞতা (বছর)</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{row.experienceYears ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">প্রশিক্ষণ প্রতিষ্ঠান</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{row.trainingProvider ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">সার্টিফিকেট নং</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{row.certificateNumber ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">সার্টিফিকেট / নিবন্ধন</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">{row.certification ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">পরিচিতি</dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">{row.bio ?? "—"}</dd>
          </div>
        </dl>
      </AdminFormSection>

      <AdminFormSection title="সেবা এলাকা (জেলা স্তর)" description="নাম ও লোকেশন আইডি।">
        {row.divisionCoverageAreas.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">কোনো এলাকা নেই।</p>
        ) : (
          <ul className="space-y-3">
            {row.divisionCoverageAreas.map((a) => (
              <li
                key={a.id}
                className="rounded-[var(--pd-admin-radius-sm,0.5rem)] border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {a.district} / {a.upazila}
                    {a.unionOrArea ? ` — ${a.unionOrArea}` : ""}
                  </span>
                  <AdminBadge variant={a.isActive ? "success" : "neutral"}>
                    {a.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </AdminBadge>
                </div>
                <p className="mt-1 font-mono text-xs text-zinc-500">
                  districtId: {a.districtId ?? "—"} · upazilaId: {a.upazilaId ?? "—"} · unionId:{" "}
                  {a.unionId ?? "—"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </AdminFormSection>

      <AdminFormSection
        title="নথি ও আপলোড"
        description="প্রতিটি ফাইল সুরক্ষিত অ্যাডমিন রুটের মাধ্যমে খোলা হয় (স্বাক্ষরিত URL সরাসরি UI-তে দেখানো হয় না)।"
      >
        {row.documents.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">কোনো নথি নেই।</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {row.documents.map((d) => {
              const href = documentAccessHref(d);
              const mime = docResolvedMime(d);
              const safeDl = href != null && isSafeDownloadMime(mime);
              const image = href && mime && isImageMime(mime);
              const pdf = href && mime && isPdfMime(mime);

              return (
                <article
                  key={d.id}
                  className="flex flex-col rounded-[var(--pd-admin-radius)] border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {docTypeBn(d.type)}
                      </h3>
                      <p className="mt-0.5 break-all text-xs text-zinc-600 dark:text-zinc-400">
                        {displayFileName(d)}
                      </p>
                    </div>
                    <AdminBadge variant={docReviewBadgeVariant(d.reviewStatus)}>
                      {docReviewBn(d.reviewStatus)}
                    </AdminBadge>
                  </div>
                  <dl className="mt-3 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                    <div>
                      <dt className="inline font-medium text-zinc-500">MIME: </dt>
                      <dd className="inline">{mime ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-zinc-500">আপলোডের সময়: </dt>
                      <dd className="inline">{format(new Date(d.uploadedAt), "PPp")}</dd>
                    </div>
                    {d.uploadedFile?.sizeBytes != null ? (
                      <div>
                        <dt className="inline font-medium text-zinc-500">আকার: </dt>
                        <dd className="inline">{formatBytesShort(d.uploadedFile.sizeBytes)}</dd>
                      </div>
                    ) : null}
                  </dl>
                  {image && href ? (
                    <button
                      type="button"
                      onClick={() => setPreview({ href, title: docTypeBn(d.type), mime })}
                      className="mt-3 block w-full overflow-hidden rounded-md border border-zinc-200 bg-white dark:border-zinc-600 dark:bg-zinc-950"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={href}
                        alt=""
                        className="mx-auto max-h-36 w-full object-contain"
                      />
                    </button>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {href ? (
                      <>
                        {image ? (
                          <AdminActionButton
                            type="button"
                            variant="secondary"
                            onClick={() => setPreview({ href, title: docTypeBn(d.type), mime })}
                          >
                            বড় করে দেখুন
                          </AdminActionButton>
                        ) : null}
                        <AdminActionButton variant="secondary" href={href} target="_blank" rel="noreferrer">
                          {pdf ? "পিডিএফ খুলুন" : "খুলুন"}
                        </AdminActionButton>
                        {safeDl ? (
                          <AdminActionButton variant="ghost" href={href} download target="_blank" rel="noreferrer">
                            ডাউনলোড
                          </AdminActionButton>
                        ) : null}
                      </>
                    ) : d.storageKey ? (
                      <span className="text-xs text-amber-800 dark:text-amber-200">
                        শুধু স্টোরেজ কী — প্রিভিউ উপলব্ধ নয়।
                      </span>
                    ) : (
                      <AdminBadge variant="warning">ফাইল নেই</AdminBadge>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </AdminFormSection>

      <AdminFormSection title="অ্যাডমিন নোট ও ইতিহাস" description={row.statusHistoryNote}>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">অ্যাডমিন নোট</dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
              {row.adminNote ?? "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">সংশোধন নোট</dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
              {row.correctionNote ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">পর্যালোচক</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {row.reviewedBy
                ? `${row.reviewedBy.email}${row.reviewedBy.displayName ? ` (${row.reviewedBy.displayName})` : ""}`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">পর্যালোচনার সময়</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {row.reviewedAt ? format(new Date(row.reviewedAt), "PPp") : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">প্রকাশের সময়</dt>
            <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
              {row.publishedAt ? format(new Date(row.publishedAt), "PPp") : "—"}
            </dd>
          </div>
        </dl>
      </AdminFormSection>

      <AdminFormSection title="অ্যাডমিন কাজ" description="স্ট্যাটাস সার্ভারে যাচাই হয়।">
        <div className="flex flex-wrap gap-2">
          {st === AI_TECHNICIAN_STATUS.SUBMITTED ? (
            <AdminActionButton
              variant="primary"
              disabled={mutating}
              onClick={() =>
                openActionDialog({
                  action: "mark_under_review",
                  title: "পর্যালোচনায় নিন",
                  message: "এই আবেদনটি পর্যালোচনাধীন অবস্থায় নেবেন?",
                  primaryNoteRequired: false,
                  primaryNoteLabel: "",
                  showOptionalAdminNote: false,
                })
              }
            >
              পর্যালোচনায় নিন
            </AdminActionButton>
          ) : null}

          {st === AI_TECHNICIAN_STATUS.UNDER_REVIEW ? (
            <>
              <AdminActionButton
                variant="secondary"
                disabled={mutating}
                onClick={() =>
                  openActionDialog({
                    action: "request_correction",
                    title: "সংশোধন চান",
                    message: "আবেদনকারীকে সংশোধনের জন্য ফেরত পাঠাতে নিচে বিস্তারিত নোট লিখুন।",
                    primaryNoteRequired: true,
                    primaryNoteLabel: "সংশোধন নির্দেশনা (প্রয়োজনীয়)",
                    showOptionalAdminNote: true,
                  })
                }
              >
                সংশোধন চান
              </AdminActionButton>
              <AdminActionButton
                variant="primary"
                disabled={mutating}
                onClick={() =>
                  openActionDialog({
                    action: "approve",
                    title: "অনুমোদন",
                    message: "এই আবেদন অনুমোদন করবেন?",
                    primaryNoteRequired: false,
                    primaryNoteLabel: "",
                    showOptionalAdminNote: true,
                  })
                }
              >
                অনুমোদন
              </AdminActionButton>
              <AdminActionButton
                variant="danger"
                disabled={mutating}
                onClick={() =>
                  openActionDialog({
                    action: "reject",
                    title: "প্রত্যাখ্যান",
                    message: "আবেদন প্রত্যাখ্যান করলে ফিরিয়ে নেওয়া যাবে না। কারণ লিখুন।",
                    primaryNoteRequired: true,
                    primaryNoteLabel: "প্রত্যাখ্যানের কারণ (প্রয়োজনীয়)",
                    showOptionalAdminNote: false,
                  })
                }
              >
                প্রত্যাখ্যান
              </AdminActionButton>
            </>
          ) : null}

          {st === AI_TECHNICIAN_STATUS.APPROVED ? (
            <>
              <AdminActionButton
                variant="primary"
                disabled={mutating}
                onClick={() =>
                  openActionDialog({
                    action: "publish",
                    title: "প্রকাশ",
                    message:
                      "প্রকাশ করলে ব্যবহারকারী টেকনিশিয়ান ভূমিকা পাবে। চালিয়ে যাবেন?",
                    primaryNoteRequired: false,
                    primaryNoteLabel: "",
                    showOptionalAdminNote: false,
                  })
                }
              >
                প্রকাশ
              </AdminActionButton>
              <AdminActionButton
                variant="danger"
                disabled={mutating}
                onClick={() =>
                  openActionDialog({
                    action: "suspend",
                    title: "স্থগিত",
                    message: "এই প্রোফাইল স্থগিত করা হবে এবং ব্যবহারকারী স্থগিত অবস্থায় যাবে।",
                    primaryNoteRequired: false,
                    primaryNoteLabel: "",
                    showOptionalAdminNote: false,
                  })
                }
              >
                স্থগিত
              </AdminActionButton>
            </>
          ) : null}

          {st === AI_TECHNICIAN_STATUS.PUBLISHED ? (
            <>
              <AdminActionButton
                variant="secondary"
                disabled={mutating}
                onClick={() =>
                  openActionDialog({
                    action: "unpublish",
                    title: "অপ্রকাশ",
                    message: "প্রোফাইল অনুমোদিত অবস্থায় ফিরে যাবে। চালিয়ে যাবেন?",
                    primaryNoteRequired: false,
                    primaryNoteLabel: "",
                    showOptionalAdminNote: false,
                  })
                }
              >
                অপ্রকাশ
              </AdminActionButton>
              <AdminActionButton
                variant="danger"
                disabled={mutating}
                onClick={() =>
                  openActionDialog({
                    action: "suspend",
                    title: "স্থগিত",
                    message: "প্রকাশিত প্রোফাইল স্থগিত করা হবে। নিশ্চিত?",
                    primaryNoteRequired: false,
                    primaryNoteLabel: "",
                    showOptionalAdminNote: false,
                  })
                }
              >
                স্থগিত
              </AdminActionButton>
              <AdminActionButton href={`/admin/ai-technicians/${applicationId}/edit`} variant="secondary">
                সম্পাদনা (পুরোনো ফর্ম)
              </AdminActionButton>
            </>
          ) : null}

          {st === AI_TECHNICIAN_STATUS.SUSPENDED ? (
            <AdminActionButton
              variant="primary"
              disabled={mutating}
              onClick={() =>
                openActionDialog({
                  action: "lift_suspension",
                  title: "স্থগিতাদেশ তুলুন",
                  message: "অবস্থা ‘অনুমোদিত’ হবে। চালিয়ে যাবেন?",
                  primaryNoteRequired: false,
                  primaryNoteLabel: "",
                  showOptionalAdminNote: false,
                })
              }
            >
              স্থগিতাদেশ তুলুন
            </AdminActionButton>
          ) : null}
        </div>
      </AdminFormSection>

      <div className="flex flex-wrap gap-2">
        <AdminActionButton href="/admin/ai-technicians/applications" variant="secondary">
          ← তালিকা
        </AdminActionButton>
        <AdminActionButton href="/admin/ai-technicians" variant="secondary">
          টেকনিশিয়ান হোম
        </AdminActionButton>
      </div>
    </div>
  );
}
