"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { FormAsyncControlSkeleton } from "@/components/admin-ui/FormAsyncControlSkeleton";
import { khInputClass, khLabelClass } from "@/components/admin/knowledge-hub/styles";
import { MetadataBuilder } from "@/components/admin/semen-template/MetadataBuilder";
import { ProviderSelect } from "@/components/admin/semen-template/ProviderSelect";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { withRetry } from "@/lib/admin/fetch-with-retry";
import { cn } from "@/lib/cn";
import { useClientMountReady } from "@/lib/admin/use-client-mount-ready";
import { sanitizeAdminRichHtml } from "@/lib/sanitize-admin-html";

import "./semen-form-premium.css";

import type { AdminLivestockBreedRow } from "./LivestockBreedsList";
import type { AdminSemenProviderRow } from "./SemenProvidersList";
import type { SemenTemplateMediaFormRow } from "./semen-template-media-types";
import {
  ANIMAL_TYPE_OPTIONS,
  DEFAULT_SEMEN_TEMPLATE_MEDIA_KIND,
  SEMEN_PRODUCT_KIND_OPTIONS,
  SEMEN_TEMPLATE_APPROVAL_STATUS_OPTIONS,
  type AnimalTypeValue,
  type SemenProductKindValue,
  type SemenTemplateApprovalStatusValue,
  type SemenTemplateMediaKindValue,
} from "./semen-ui-options";

const LazyGalleryUploader = dynamic(
  () => import("@/components/admin/semen-template/GalleryUploader").then((m) => m.GalleryUploader),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse space-y-3 rounded-[var(--pd-admin-radius)] border border-zinc-200/80 bg-[var(--pd-admin-surface)] p-4 dark:border-zinc-800">
        <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-24 rounded-lg bg-zinc-100 dark:bg-zinc-800/80" />
        <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800/60" />
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">মিডিয়া ইউআই লোড হচ্ছে…</p>
      </div>
    ),
  },
);

const LazyRichTextEditor = dynamic(
  () => import("@/components/admin/semen-template/RichTextEditor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse space-y-2 rounded-lg border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-20 rounded-md bg-white dark:bg-zinc-950" />
        <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400">সম্পাদক লোড হচ্ছে…</p>
      </div>
    ),
  },
);

export type SemenServiceTemplateFormProps = { mode: "create" } | { mode: "edit"; templateId: string };

type BreedPickRow = { clientKey: string; breedId: string; percentage: string };

type AdminSemenTemplateDetail = {
  id: string;
  internalName: string;
  animalType: string;
  semenProviderId: string;
  semenProductKind: string;
  otherSemenLabel: string | null;
  shortDescription: string | null;
  detailedDescription: string | null;
  expectedBenefits: string | null;
  recommendedAnimalCondition: string | null;
  warningsContraindications: string | null;
  defaultBasePrice: string;
  defaultOfferPrice: string | null;
  defaultDiscountPercent: string | null;
  tagsJson: unknown;
  isActive: boolean;
  approvalStatus: string;
  approvedById: string | null;
  approvedBy: { id: string; email: string } | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
  breedMix?: {
    id: string;
    breedId: string;
    percentage: string;
    breed: { id: string; nameEn: string; nameBn: string };
  }[] | null;
  media?: {
    id: string;
    kind: string;
    uploadedFileId: string | null;
    externalUrl: string | null;
    sortOrder: number;
  }[] | null;
};

type FormSectionStatus = "active" | "complete" | "warning" | "idle";
type SaveIntent = "draft" | "continue" | "publish";

function htmlPlainLen(html: string): number {
  return html.replace(/<[^>]+>/g, "").replace(/\u00a0/g, " ").trim().length;
}

const DEFAULT_BREED_ROW_KEY = "breed-row-default";

function SemenTemplateFormSkeleton() {
  return (
    <div className="animate-pulse space-y-5 pb-10" aria-busy="true" aria-label="টেমপ্লেট লোড হচ্ছে">
      <div className="h-52 rounded-[var(--pd-admin-radius)] bg-zinc-200/70 dark:bg-zinc-800/80" />
      <div className="h-52 rounded-[var(--pd-admin-radius)] bg-zinc-200/70 dark:bg-zinc-800/80" />
      <div className="h-64 rounded-[var(--pd-admin-radius)] bg-zinc-200/60 dark:bg-zinc-800/70" />
      <div className="h-40 rounded-[var(--pd-admin-radius)] bg-zinc-200/50 dark:bg-zinc-800/60" />
      <div className="h-40 rounded-[var(--pd-admin-radius)] bg-zinc-200/50 dark:bg-zinc-800/60" />
    </div>
  );
}

function SemenAdminFormCard({
  title,
  description,
  children,
  className,
  step,
  id,
  dataSection,
  compact,
}: Readonly<{
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  step?: number;
  id?: string;
  dataSection?: string;
  compact?: boolean;
}>) {
  return (
    <section
      id={id}
      data-section={dataSection}
      className={cn(
        "pd-semen-form-card group relative flex min-h-0 flex-col overflow-visible rounded-[var(--pd-semen-form-radius,1rem)] border border-zinc-200/80 bg-[var(--pd-admin-surface)] transition-shadow duration-300 dark:border-zinc-800/90 dark:bg-zinc-900/85",
        compact && "pd-semen-form-card--compact",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-600/0 via-emerald-500/45 to-emerald-600/0 opacity-80 dark:via-emerald-400/35"
        aria-hidden
      />
      <header className="pd-semen-form-card-header relative shrink-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1.5">
            {typeof step === "number" ? (
              <span className="pd-semen-step-badge">ধাপ {step}</span>
            ) : null}
            <h2 className="pd-semen-form-card-title">{title}</h2>
            {description ? <p className="pd-semen-form-card-desc">{description}</p> : null}
          </div>
        </div>
      </header>
      <div className="pd-semen-form-card-body relative min-h-0 flex-1">{children}</div>
    </section>
  );
}

const UnsavedChangesIndicator = memo(function UnsavedChangesIndicator({ isDirty }: Readonly<{ isDirty: boolean }>) {
  return (
    <span
      className={cn(
        "pd-semen-unsaved-indicator",
        isDirty ? "pd-semen-unsaved-indicator--dirty" : "pd-semen-unsaved-indicator--clean",
      )}
    >
      {isDirty ? "Unsaved changes" : "সব পরিবর্তন সিঙ্ক আছে"}
    </span>
  );
});

const FormActionBar = memo(function FormActionBar({
  isDirty,
  blockingIssuesCount,
  issueSummary,
  saveDisabled,
  saveDisabledReason,
  saving,
  onSaveDraft,
  onSaveContinue,
}: Readonly<{
  isDirty: boolean;
  blockingIssuesCount: number;
  issueSummary: string | null;
  saveDisabled: boolean;
  saveDisabledReason: string | null;
  saving: boolean;
  onSaveDraft: () => void;
  onSaveContinue: () => void;
}>) {
  return (
    <div className="pd-semen-action-bar">
      <div className="pd-semen-action-bar-meta">
        <div className="pd-semen-action-bar-status">
          <AdminBadge variant={blockingIssuesCount > 0 ? "warning" : "success"}>
            {blockingIssuesCount > 0 ? `${blockingIssuesCount}টি validation issue` : "Validation clean"}
          </AdminBadge>
          <UnsavedChangesIndicator isDirty={isDirty} />
        </div>
        <p className="pd-semen-action-bar-hint">
          {issueSummary ? `Pending: ${issueSummary}` : "লং ফর্মে বাধাহীন এডিটিং মোড।"}
        </p>
      </div>
      <div className="pd-semen-action-bar-actions">
        <AdminActionButton
          type="submit"
          variant="secondary"
          className="!px-3 !py-2 text-xs sm:text-sm"
          disabled={saveDisabled}
          aria-busy={saving}
          onClick={onSaveDraft}
        >
          Save Draft
        </AdminActionButton>
        <AdminActionButton
          type="submit"
          variant="primary"
          className="!min-w-[9rem] !px-4 !py-2.5 text-sm font-semibold"
          disabled={saveDisabled}
          aria-busy={saving}
          onClick={onSaveContinue}
        >
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              সংরক্ষণ…
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Save className="h-4 w-4" aria-hidden />
              Save &amp; Continue
            </span>
          )}
        </AdminActionButton>
      </div>
      {saveDisabledReason ? <p className="pd-semen-action-bar-reason">{saveDisabledReason}</p> : null}
    </div>
  );
});

const FormBottomActions = memo(function FormBottomActions({
  isDirty,
  blockingIssuesCount,
  saveDisabled,
  saving,
  onSaveDraft,
  onSaveContinue,
  onPublish,
  onBackToTop,
}: Readonly<{
  isDirty: boolean;
  blockingIssuesCount: number;
  saveDisabled: boolean;
  saving: boolean;
  onSaveDraft: () => void;
  onSaveContinue: () => void;
  onPublish: () => void;
  onBackToTop: () => void;
}>) {
  return (
    <section className="pd-semen-bottom-actions">
      <div className="pd-semen-bottom-actions-meta">
        <div className="pd-semen-bottom-actions-status">
          <AdminBadge variant={blockingIssuesCount > 0 ? "warning" : "success"}>
            {blockingIssuesCount > 0 ? `${blockingIssuesCount}টি validation issue` : "Validation clean"}
          </AdminBadge>
          <UnsavedChangesIndicator isDirty={isDirty} />
        </div>
        <p className="pd-semen-bottom-actions-hint">ফাইনাল রিভিউ শেষে সংরক্ষণ করুন, তারপর প্রকাশ করুন।</p>
      </div>
      <div className="pd-semen-bottom-actions-actions">
        <AdminActionButton
          type="submit"
          variant="secondary"
          className="!px-3 !py-2 text-xs sm:text-sm"
          disabled={saveDisabled}
          aria-busy={saving}
          onClick={onSaveDraft}
        >
          Save Draft
        </AdminActionButton>
        <AdminActionButton
          type="submit"
          variant="primary"
          className="!min-w-[9rem] !px-4 !py-2.5 text-sm font-semibold"
          disabled={saveDisabled}
          aria-busy={saving}
          onClick={onSaveContinue}
        >
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              সংরক্ষণ…
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Save className="h-4 w-4" aria-hidden />
              Save &amp; Continue
            </span>
          )}
        </AdminActionButton>
        <AdminActionButton
          type="button"
          variant="secondary"
          className="!px-3 !py-2 text-xs sm:text-sm"
          disabled
          aria-disabled
          onClick={onPublish}
        >
          Publish
        </AdminActionButton>
        <AdminActionButton
          type="button"
          variant="ghost"
          className="!px-3 !py-2 text-xs sm:text-sm"
          onClick={onBackToTop}
        >
          Back to top
        </AdminActionButton>
      </div>
    </section>
  );
});

function richToStored(html: string): string | null {
  const sanitized = sanitizeAdminRichHtml(html);
  const text = sanitized.replace(/<[^>]+>/g, "").replace(/\u00a0/g, " ").trim();
  return text.length > 0 ? sanitized : null;
}

export function SemenServiceTemplateForm(props: SemenServiceTemplateFormProps) {
  const router = useRouter();
  const templateId = props.mode === "edit" ? props.templateId : "";
  const [loadKey, setLoadKey] = useState(0);
  const [loading, setLoading] = useState(props.mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<AdminSemenProviderRow[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [breeds, setBreeds] = useState<AdminLivestockBreedRow[]>([]);
  const [breedsLoading, setBreedsLoading] = useState(true);
  const clientMountReady = useClientMountReady();

  const [internalName, setInternalName] = useState("");
  const [animalType, setAnimalType] = useState<AnimalTypeValue>("CATTLE");
  const [semenProviderId, setSemenProviderId] = useState("");
  const [semenProductKind, setSemenProductKind] = useState<SemenProductKindValue>("NORMAL");
  const [otherSemenLabel, setOtherSemenLabel] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [expectedBenefits, setExpectedBenefits] = useState("");
  const [recommendedAnimalCondition, setRecommendedAnimalCondition] = useState("");
  const [warningsContraindications, setWarningsContraindications] = useState("");
  const [defaultBasePrice, setDefaultBasePrice] = useState("");
  const [defaultOfferPrice, setDefaultOfferPrice] = useState("");
  const [defaultDiscountPercent, setDefaultDiscountPercent] = useState("");
  const [tagsJsonText, setTagsJsonText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [approvalStatus, setApprovalStatus] =
    useState<SemenTemplateApprovalStatusValue>("DRAFT");
  const [breedRows, setBreedRows] = useState<BreedPickRow[]>([
    { clientKey: DEFAULT_BREED_ROW_KEY, breedId: "", percentage: "100" },
  ]);
  const [mediaRows, setMediaRows] = useState<SemenTemplateMediaFormRow[]>([]);
  const saveCoordinatorRef = useRef<{
    intent: SaveIntent;
    lastSectionId: string | null;
    lastCheckpointAt: number | null;
  }>({ intent: "continue", lastSectionId: null, lastCheckpointAt: null });

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectedReasonField, setRejectedReasonField] = useState("");
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [mediaSectionBusy, setMediaSectionBusy] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [auditMeta, setAuditMeta] = useState<{
    id: string;
    createdAt: string;
    updatedAt: string;
    approvedAt: string | null;
    approvedBy: { id: string; email: string } | null;
  } | null>(null);

  const breedSum = useMemo(() => {
    return breedRows.reduce((acc, r) => acc + (Number(r.percentage) || 0), 0);
  }, [breedRows]);

  const formCompletionPct = useMemo(() => {
    let w = 0;
    const total = 5;
    if (internalName.trim() && semenProviderId.trim()) w += 1;
    if (defaultBasePrice.trim()) w += 1;
    if (Math.abs(breedSum - 100) <= 0.02 && breedRows.some((r) => r.breedId.trim())) w += 1;
    if (
      htmlPlainLen(shortDescription) > 0 ||
      htmlPlainLen(detailedDescription) > 0 ||
      htmlPlainLen(expectedBenefits) > 0
    ) {
      w += 1;
    }
    if (mediaRows.some((m) => m.uploadedFileId.trim() || m.externalUrl.trim())) w += 1;
    return Math.min(100, Math.round((w / total) * 100));
  }, [
    internalName,
    semenProviderId,
    defaultBasePrice,
    breedSum,
    breedRows,
    shortDescription,
    detailedDescription,
    expectedBenefits,
    mediaRows,
  ]);

  const formSnapshot = useMemo(
    () =>
      JSON.stringify({
        internalName: internalName.trim(),
        animalType,
        semenProviderId: semenProviderId.trim(),
        semenProductKind,
        otherSemenLabel: otherSemenLabel.trim(),
        shortDescription,
        detailedDescription,
        expectedBenefits,
        recommendedAnimalCondition,
        warningsContraindications,
        defaultBasePrice: defaultBasePrice.trim(),
        defaultOfferPrice: defaultOfferPrice.trim(),
        defaultDiscountPercent: defaultDiscountPercent.trim(),
        tagsJsonText,
        isActive,
        approvalStatus,
        rejectedReasonField: rejectedReasonField.trim(),
        breedRows: breedRows.map((r) => ({ breedId: r.breedId.trim(), percentage: r.percentage.trim() })),
        mediaRows: mediaRows.map((r) => ({
          kind: r.kind,
          uploadedFileId: r.uploadedFileId.trim(),
          externalUrl: r.externalUrl.trim(),
        })),
      }),
    [
      internalName,
      animalType,
      semenProviderId,
      semenProductKind,
      otherSemenLabel,
      shortDescription,
      detailedDescription,
      expectedBenefits,
      recommendedAnimalCondition,
      warningsContraindications,
      defaultBasePrice,
      defaultOfferPrice,
      defaultDiscountPercent,
      tagsJsonText,
      isActive,
      approvalStatus,
      rejectedReasonField,
      breedRows,
      mediaRows,
    ],
  );

  const initialSnapshotRef = useRef<string | null>(null);
  const providersListBusy = !clientMountReady || providersLoading;
  const breedsListBusy = !clientMountReady || breedsLoading;
  const providerSelectDisabled = saving || providersListBusy;
  const breedSelectDisabled = saving || breedsListBusy;
  const saveDisabled = saving || approvalBusy || mediaSectionBusy || providersListBusy || breedsListBusy;

  const setSaveIntent = useCallback((intent: SaveIntent) => {
    saveCoordinatorRef.current.intent = intent;
  }, []);

  const registerSectionCheckpoint = useCallback((sectionId: string) => {
    saveCoordinatorRef.current.lastSectionId = sectionId;
    saveCoordinatorRef.current.lastCheckpointAt = Date.now();
  }, []);

  const handleSaveDraft = useCallback(() => setSaveIntent("draft"), [setSaveIntent]);
  const handleSaveContinue = useCallback(() => setSaveIntent("continue"), [setSaveIntent]);
  const handlePublishIntent = useCallback(() => setSaveIntent("publish"), [setSaveIntent]);

  function stepStatusFromFlags(
    active: boolean,
    complete: boolean,
    warning: boolean,
  ): FormSectionStatus {
    if (active) return "active";
    if (warning) return "warning";
    if (complete) return "complete";
    return "idle";
  }

  function stepStateClasses(status: FormSectionStatus): string {
    if (status === "active") {
      return "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200";
    }
    if (status === "complete") {
      return "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200";
    }
    if (status === "warning") {
      return "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200";
    }
    return "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300";
  }
  useEffect(() => {
    if (loading) {
      initialSnapshotRef.current = null;
      return;
    }
    if (initialSnapshotRef.current === null) {
      initialSnapshotRef.current = formSnapshot;
      setIsDirty(false);
      return;
    }
    setIsDirty(formSnapshot !== initialSnapshotRef.current);
  }, [formSnapshot, loading]);

  const loadTemplate = useCallback(async () => {
    if (props.mode !== "edit") return;
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{ template: AdminSemenTemplateDetail }>(
        await adminFetch(`/api/admin/semen-service-templates/${templateId}`),
      );
      const t = data.template;
      setInternalName(t.internalName);
      setAnimalType(t.animalType as AnimalTypeValue);
      setSemenProviderId(t.semenProviderId);
      setSemenProductKind(t.semenProductKind as SemenProductKindValue);
      setOtherSemenLabel(t.otherSemenLabel ?? "");
      setShortDescription(t.shortDescription ?? "");
      setDetailedDescription(t.detailedDescription ?? "");
      setExpectedBenefits(t.expectedBenefits ?? "");
      setRecommendedAnimalCondition(t.recommendedAnimalCondition ?? "");
      setWarningsContraindications(t.warningsContraindications ?? "");
      setDefaultBasePrice(t.defaultBasePrice);
      setDefaultOfferPrice(t.defaultOfferPrice ?? "");
      setDefaultDiscountPercent(t.defaultDiscountPercent ?? "");
      setTagsJsonText(
        t.tagsJson == null ? "" : JSON.stringify(t.tagsJson, null, 2),
      );
      setIsActive(t.isActive);
      setApprovalStatus(t.approvalStatus as SemenTemplateApprovalStatusValue);
      setRejectedReasonField(t.rejectedReason ?? "");
      setAuditMeta({
        id: t.id,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        approvedAt: t.approvedAt ?? null,
        approvedBy: t.approvedBy ?? null,
      });
      const mix = t.breedMix ?? [];
      setBreedRows(
        mix.length > 0
          ? mix.map((m) => ({
              clientKey: m.id,
              breedId: m.breedId,
              percentage: m.percentage,
            }))
          : [{ clientKey: DEFAULT_BREED_ROW_KEY, breedId: "", percentage: "100" }],
      );
      setMediaRows(
        (t.media ?? []).map((m) => ({
          clientKey: m.id,
          kind: m.kind as SemenTemplateMediaKindValue,
          uploadedFileId: m.uploadedFileId ?? "",
          externalUrl: m.externalUrl ?? "",
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [props.mode, templateId]);

  const formAliveRef = useRef(true);
  useEffect(() => {
    formAliveRef.current = true;
    return () => {
      formAliveRef.current = false;
    };
  }, []);

  const loadProviders = useCallback(async () => {
    setProvidersLoading(true);
    setProvidersError(null);
    try {
      const data = await withRetry(
        async () =>
          readAdminJson<{ providers: AdminSemenProviderRow[] }>(
            await adminFetch("/api/admin/semen-providers?limit=200&isActive=true"),
          ),
        { retries: 2, baseDelayMs: 450 },
      );
      if (formAliveRef.current) {
        setProviders(data.providers);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "প্রদানকারী লোড ব্যর্থ";
      if (formAliveRef.current) {
        setProvidersError(msg);
        setProviders([]);
        toast.error(msg);
      }
    } finally {
      if (formAliveRef.current) {
        setProvidersLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void loadProviders();
  }, [loadProviders]);

  useEffect(() => {
    let cancelled = false;
    const at = animalType;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- set load indicator before async fetch
    setBreedsLoading(true);
    (async () => {
      try {
        const qs = new URLSearchParams({
          animalType: at,
          limit: "200",
          isActive: "true",
        });
        const data = await withRetry(
          async () =>
            readAdminJson<{ breeds: AdminLivestockBreedRow[] }>(
              await adminFetch(`/api/admin/livestock-breeds?${qs.toString()}`),
            ),
          { retries: 1, baseDelayMs: 400 },
        );
        if (!cancelled && formAliveRef.current) {
          setBreeds(data.breeds);
        }
      } catch {
        /* keep existing list on failure */
      } finally {
        if (!cancelled && formAliveRef.current) {
          setBreedsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [animalType]);

  useEffect(() => {
    if (props.mode !== "edit") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void loadTemplate();
  }, [props.mode, loadTemplate, loadKey]);

  const onMediaSectionBusy = useCallback((busy: boolean) => {
    setMediaSectionBusy(busy);
  }, []);

  const onMediaSectionError = useCallback((message: string | null) => {
    setError(message);
  }, []);

  function addBreedRow() {
    setBreedRows((rows) => [
      ...rows,
      { clientKey: globalThis.crypto.randomUUID(), breedId: "", percentage: "" },
    ]);
  }

  function removeBreedRow(i: number) {
    setBreedRows((rows) => rows.filter((_, idx) => idx !== i));
  }

  function setBreedRow(i: number, patch: Partial<BreedPickRow>) {
    setBreedRows((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function addMediaRow(kind?: SemenTemplateMediaKindValue) {
    setMediaRows((rows) => [
      ...rows,
      {
        clientKey: globalThis.crypto.randomUUID(),
        kind: kind ?? DEFAULT_SEMEN_TEMPLATE_MEDIA_KIND,
        uploadedFileId: "",
        externalUrl: "",
      },
    ]);
  }

  function removeMediaRow(i: number) {
    setMediaRows((rows) => rows.filter((_, idx) => idx !== i));
  }

  function setMediaRow(i: number, patch: Partial<SemenTemplateMediaFormRow>) {
    setMediaRows((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function swapMediaAdjacent(index: number, direction: -1 | 1) {
    setMediaRows((rows) => {
      const j = index + direction;
      if (j < 0 || j >= rows.length) return rows;
      const next = [...rows];
      const a = next[index];
      const b = next[j];
      if (!a || !b) return rows;
      next[index] = b;
      next[j] = a;
      return next;
    });
  }

  function onMediaKindChange(i: number, next: SemenTemplateMediaKindValue) {
    const row = mediaRows[i];
    if (!row) return;
    const fileKinds: SemenTemplateMediaKindValue[] = ["COVER", "GALLERY", "VIDEO_UPLOAD"];
    const wasFile = fileKinds.includes(row.kind);
    const isFile = fileKinds.includes(next);
    if (wasFile !== isFile) {
      setMediaRow(i, { kind: next, uploadedFileId: "", externalUrl: "" });
    } else {
      setMediaRow(i, { kind: next });
    }
  }

  function buildPayload(): Record<string, unknown> {
    let tagsJson: unknown = undefined;
    if (tagsJsonText.trim()) {
      try {
        tagsJson = JSON.parse(tagsJsonText) as unknown;
      } catch {
        throw new Error("tagsJson অবৈধ JSON");
      }
    } else {
      tagsJson = null;
    }

    const breedMix = breedRows
      .filter((r) => r.breedId.trim())
      .map((r) => ({
        breedId: r.breedId.trim(),
        percentage: Number(r.percentage),
      }));

    const media = mediaRows
      .map((m, i) => ({
        kind: m.kind,
        uploadedFileId: m.uploadedFileId.trim() || null,
        externalUrl: m.externalUrl.trim() || null,
        sortOrder: i,
      }))
      .filter((m) => m.uploadedFileId || m.externalUrl);

    const hasOffer = defaultOfferPrice.trim() !== "";
    const hasDisc = defaultDiscountPercent.trim() !== "";

    return {
      internalName: internalName.trim(),
      animalType,
      semenProviderId: semenProviderId.trim(),
      semenProductKind,
      otherSemenLabel:
        semenProductKind === "OTHER" ? otherSemenLabel.trim() || null : null,
      shortDescription: richToStored(shortDescription),
      detailedDescription: richToStored(detailedDescription),
      expectedBenefits: richToStored(expectedBenefits),
      recommendedAnimalCondition: richToStored(recommendedAnimalCondition),
      warningsContraindications: richToStored(warningsContraindications),
      defaultBasePrice: defaultBasePrice.trim(),
      defaultOfferPrice: hasOffer ? defaultOfferPrice.trim() : null,
      defaultDiscountPercent: hasDisc ? defaultDiscountPercent.trim() : null,
      tagsJson,
      isActive,
      approvalStatus,
      rejectedReason:
        approvalStatus === "REJECTED" ? rejectedReasonField.trim() || null : null,
      breedMix,
      media,
    };
  }

  const scrollToSection = useCallback(
    (sectionId: string) => {
      registerSectionCheckpoint(sectionId);
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [registerSectionCheckpoint],
  );
  const handleBackToTop = useCallback(() => scrollToSection("semen-template-top"), [scrollToSection]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (!internalName.trim()) {
        throw new Error("অভ্যন্তরীণ নাম লিখুন");
      }
      if (!semenProviderId.trim()) {
        throw new Error("সিমেন প্রদানকারী নির্বাচন করুন");
      }
      if (semenProductKind === "OTHER" && !otherSemenLabel.trim()) {
        throw new Error("অন্যান্য লেবেল লিখুন");
      }
      const hasOffer = defaultOfferPrice.trim() !== "";
      const hasDisc = defaultDiscountPercent.trim() !== "";
      if (hasOffer && hasDisc) {
        throw new Error("অফার মূল্য ও ছাড় % একসাথে দেওয়া যাবে না");
      }
      if (!defaultBasePrice.trim()) {
        throw new Error("মূল মূল্য লিখুন");
      }
      if (approvalStatus === "REJECTED" && !rejectedReasonField.trim()) {
        throw new Error("প্রত্যাখ্যানের কারণ লিখুন");
      }
      const payload = buildPayload();
      if (Math.abs(breedSum - 100) > 0.02) {
        throw new Error(`জাতের শতাংশের যোগফল ১০০ হতে হবে (বর্তমান: ${breedSum})`);
      }
      if (props.mode === "create") {
        await readAdminJson<{ template: { id: string } }>(
          await adminFetch("/api/admin/semen-service-templates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
      } else {
        await readAdminJson<{ template: unknown }>(
          await adminFetch(`/api/admin/semen-service-templates/${templateId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
      }
      toast.success("টেমপ্লেট সংরক্ষিত হয়েছে");
      router.push("/admin/semen-service-templates");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ";
      if (msg.startsWith("অভ্যন্তরীণ নাম")) scrollToSection("semen-section-core");
      if (msg.startsWith("সিমেন প্রদানকারী")) scrollToSection("semen-section-core");
      if (msg.startsWith("অন্যান্য লেবেল")) scrollToSection("semen-section-core");
      if (msg.startsWith("অফার মূল্য")) scrollToSection("semen-section-pricing");
      if (msg.startsWith("মূল মূল্য")) scrollToSection("semen-section-pricing");
      if (msg.startsWith("প্রত্যাখ্যানের কারণ")) scrollToSection("semen-section-core");
      if (msg.startsWith("জাতের শতাংশের যোগফল")) scrollToSection("semen-section-breed");
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function onApprove(action: "APPROVE" | "REJECT") {
    if (props.mode !== "edit") return;
    if (action === "REJECT" && !rejectedReasonField.trim()) {
      setError("প্রত্যাখ্যানের কারণ লিখুন");
      return;
    }
    setApprovalBusy(true);
    setError(null);
    try {
      await readAdminJson<{ template: unknown }>(
        await adminFetch(`/api/admin/semen-service-templates/${templateId}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            rejectedReason: action === "REJECT" ? rejectedReasonField.trim() : null,
          }),
        }),
      );
      setRejectOpen(false);
      setLoadKey((k) => k + 1);
      toast.success("অনুমোদন স্ট্যাটাস হালনাগাদ হয়েছে");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "অনুমোদন ব্যর্থ";
      setError(msg);
      toast.error(msg);
    } finally {
      setApprovalBusy(false);
    }
  }

  const breedSumOk = Math.abs(breedSum - 100) <= 0.02;

  const blockingIssues = useMemo(() => {
    const issues: { label: string }[] = [];
    if (!internalName.trim()) issues.push({ label: "অভ্যন্তরীণ নাম" });
    if (!semenProviderId.trim()) issues.push({ label: "প্রদানকারী নির্বাচন" });
    if (semenProductKind === "OTHER" && !otherSemenLabel.trim()) {
      issues.push({ label: "অন্যান্য লেবেল" });
    }
    const hasOffer = defaultOfferPrice.trim() !== "";
    const hasDisc = defaultDiscountPercent.trim() !== "";
    if (hasOffer && hasDisc) issues.push({ label: "অফার/ছাড় সংঘাত" });
    if (!defaultBasePrice.trim()) issues.push({ label: "মূল মূল্য" });
    if (!breedSumOk) issues.push({ label: `জাতের যোগফল ${breedSum.toFixed(2)}%` });
    if (approvalStatus === "REJECTED" && !rejectedReasonField.trim()) {
      issues.push({ label: "প্রত্যাখ্যানের কারণ" });
    }
    return issues;
  }, [
    internalName,
    semenProviderId,
    semenProductKind,
    otherSemenLabel,
    defaultOfferPrice,
    defaultDiscountPercent,
    defaultBasePrice,
    breedSumOk,
    breedSum,
    approvalStatus,
    rejectedReasonField,
  ]);

  const issueSummary = useMemo(() => {
    if (blockingIssues.length === 0) return null;
    const visible = blockingIssues.slice(0, 2).map((issue) => issue.label).join(" · ");
    const extra = blockingIssues.length > 2 ? ` +${blockingIssues.length - 2}` : "";
    return `${visible}${extra}`;
  }, [blockingIssues]);

  const saveDisabledReason = useMemo(() => {
    if (saving) return "সংরক্ষণ চলছে…";
    if (mediaSectionBusy) return "মিডিয়া প্রসেসিং শেষ হলে সংরক্ষণ সক্রিয় হবে।";
    if (approvalBusy) return "অনুমোদন প্রক্রিয়া চলমান।";
    return null;
  }, [saving, mediaSectionBusy, approvalBusy]);

  const coreComplete = Boolean(
    internalName.trim() &&
      semenProviderId.trim() &&
      (semenProductKind !== "OTHER" || otherSemenLabel.trim()) &&
      (approvalStatus !== "REJECTED" || rejectedReasonField.trim()),
  );
  const pricingComplete = Boolean(defaultBasePrice.trim() && !(defaultOfferPrice.trim() && defaultDiscountPercent.trim()));
  const breedComplete = Boolean(breedRows.some((r) => r.breedId.trim()) && breedSumOk);
  const richComplete = Boolean(
    htmlPlainLen(shortDescription) > 0 || htmlPlainLen(detailedDescription) > 0 || htmlPlainLen(expectedBenefits) > 0,
  );
  const warningsComplete = htmlPlainLen(warningsContraindications) > 0;
  const mediaComplete = mediaRows.some((m) => m.uploadedFileId.trim() || m.externalUrl.trim());
  const metadataComplete = Boolean(tagsJsonText.trim());

  const sectionStates = [
    {
      id: "semen-section-core",
      label: "মূল তথ্য",
      status: stepStatusFromFlags(false, coreComplete, !coreComplete && !!(internalName.trim() || semenProviderId.trim())),
    },
    {
      id: "semen-section-pricing",
      label: "মূল্য নির্ধারণ",
      status: stepStatusFromFlags(false, pricingComplete, !pricingComplete && !!defaultBasePrice.trim()),
    },
    {
      id: "semen-section-breed",
      label: "জাত কম্পোজিশন",
      status: stepStatusFromFlags(false, breedComplete, !breedSumOk),
    },
    {
      id: "semen-section-description",
      label: "রিচ বিবরণ ও সতর্কতা",
      status: stepStatusFromFlags(false, richComplete || warningsComplete, false),
    },
    {
      id: "semen-section-media",
      label: "মিডিয়া",
      status: stepStatusFromFlags(false, mediaComplete, mediaSectionBusy),
    },
    {
      id: "semen-section-metadata",
      label: "মেটাডেটা",
      status: stepStatusFromFlags(false, metadataComplete, false),
    },
  ] as const;

  const firstActionableSection =
    sectionStates.find((section) => section.status === "warning" || section.status === "idle")?.id ??
    sectionStates[0]?.id;

  if (loading) {
    return (
      <div className="pd-semen-form-shell space-y-3" lang="bn">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">টেমপ্লেট লোড হচ্ছে…</p>
        <SemenTemplateFormSkeleton />
      </div>
    );
  }

  if (props.mode === "edit" && error && !internalName) {
    return (
      <AdminErrorState message={error} onRetry={() => setLoadKey((k) => k + 1)} />
    );
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      id="semen-template-top"
      className="pd-semen-template-form w-full pb-24"
      lang="bn"
    >
      <div className="pd-semen-form-shell space-y-6 lg:space-y-8">
        {/* ════════════════ ENTERPRISE PAGE HEADER ════════════════ */}
        <section className="pd-semen-page-header">
          <div className="pd-semen-page-header-top">
            <div className="min-w-0 flex-1 space-y-3">
              <nav className="text-xs text-zinc-500 dark:text-zinc-400" aria-label="breadcrumb">
                <ol className="flex flex-wrap items-center gap-1.5">
                  <li>
                    <Link className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-100" href="/admin">
                      অ্যাডমিন
                    </Link>
                  </li>
                  <li aria-hidden>/</li>
                  <li>
                    <Link className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-100" href="/admin/semen-service-templates">
                      সিমেন টেমপ্লেট
                    </Link>
                  </li>
                  <li aria-hidden>/</li>
                  <li className="font-medium text-zinc-700 dark:text-zinc-200">
                    {props.mode === "create" ? "নতুন" : "সম্পাদনা"}
                  </li>
                </ol>
              </nav>
              <h1 className="text-[1.5rem] font-bold tracking-tight text-zinc-900 sm:text-[1.75rem] dark:text-zinc-50">
                {props.mode === "create" ? "নতুন সিমেন সার্ভিস টেমপ্লেট" : "সিমেন সার্ভিস টেমপ্লেট সম্পাদনা"}
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                পণ্যের কাঠামো, মূল্য, জাত কম্পোজিশন, মিডিয়া এবং প্রকাশ অবস্থা একত্রে ম্যানেজ করুন। প্রথম রেন্ডার SSR-safe রাখা হয়েছে যাতে hydration mismatch না হয়।
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AdminBadge variant={props.mode === "create" ? "info" : "default"}>
                {props.mode === "create" ? "Draft workflow" : "Edit workflow"}
              </AdminBadge>
              <AdminBadge variant={isActive ? "success" : "neutral"}>{isActive ? "Active" : "Inactive"}</AdminBadge>
              <AdminBadge variant={blockingIssues.length > 0 ? "warning" : "success"}>
                {blockingIssues.length > 0 ? `${blockingIssues.length}টি validation issue` : "Validation clean"}
              </AdminBadge>
              <AdminActionButton href="/admin/semen-service-templates" variant="ghost">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                তালিকা
              </AdminActionButton>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-zinc-500 dark:text-zinc-400">ফর্ম অগ্রগতি</p>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{formCompletionPct}%</p>
            </div>
            <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-zinc-500 dark:text-zinc-400">জাত যোগফল</p>
              <p
                className={cn(
                  "text-base font-semibold",
                  breedSumOk ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300",
                )}
              >
                {breedSum.toFixed(2)}%
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-zinc-500 dark:text-zinc-400">মিডিয়া</p>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{mediaRows.length} items</p>
            </div>
            <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-zinc-500 dark:text-zinc-400">স্ট্যাটাস</p>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{approvalStatus}</p>
            </div>
          </div>
          <FormActionBar
            isDirty={isDirty}
            blockingIssuesCount={blockingIssues.length}
            issueSummary={issueSummary}
            saveDisabled={saveDisabled}
            saveDisabledReason={saveDisabledReason}
            saving={saving}
            onSaveDraft={handleSaveDraft}
            onSaveContinue={handleSaveContinue}
          />
        </section>

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/35 dark:text-rose-100"
          >
            {error}
          </div>
        ) : null}

        <div className="pd-semen-main-grid">
          <div className="pd-semen-content-column">
            <div className="pd-semen-section-row">
        <SemenAdminFormCard
          id="semen-section-core"
          step={1}
          title="মূল তথ্য"
          description="অভ্যন্তরীণ নাম, প্রদানকারী, পণ্যের ধরন ও প্রকাশ স্ট্যাটাস।"
        >
          <div className="space-y-5">
            <label className={khLabelClass()}>
              অভ্যন্তরীণ নাম <span className="text-rose-600">*</span>
              <input
                required
                value={internalName}
                onChange={(ev) => setInternalName(ev.target.value)}
                className={khInputClass()}
                disabled={Boolean(saving)}
              />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className={khLabelClass()}>
                প্রাণীর ধরন <span className="text-rose-600">*</span>
                <select
                  value={animalType}
                  onChange={(ev) => setAnimalType(ev.target.value as AnimalTypeValue)}
                  className={cn(khInputClass(), "pd-semen-form-select")}
                  disabled={Boolean(saving)}
                >
                  {ANIMAL_TYPE_OPTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
              <ProviderSelect
                id="semen-template-provider"
                label={
                  <>
                    সিমেন প্রদানকারী <span className="text-rose-600">*</span>
                  </>
                }
                value={semenProviderId}
                onChange={setSemenProviderId}
                providers={providers}
                loading={providersListBusy}
                loadError={providersError}
                disabled={providerSelectDisabled}
                required
                onRetry={loadProviders}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className={khLabelClass()}>
                সিমেন পণ্যের ধরন
                <select
                  value={semenProductKind}
                  onChange={(ev) => setSemenProductKind(ev.target.value as SemenProductKindValue)}
                  className={cn(khInputClass(), "pd-semen-form-select")}
                  disabled={Boolean(saving)}
                >
                  {SEMEN_PRODUCT_KIND_OPTIONS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </label>
              {semenProductKind === "OTHER" ? (
                <label className={khLabelClass()}>
                  অন্যান্য লেবেল <span className="text-rose-600">*</span>
                  <input
                    required
                    value={otherSemenLabel}
                    onChange={(ev) => setOtherSemenLabel(ev.target.value)}
                    className={khInputClass()}
                    disabled={Boolean(saving)}
                  />
                </label>
              ) : (
                <div className="hidden sm:block" aria-hidden />
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex min-h-[2.875rem] cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50/70 px-3 py-2.5 text-[15px] font-semibold text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:border-zinc-600">
                <input
                  type="checkbox"
                  className="size-5 shrink-0 rounded border-zinc-300 text-emerald-600 focus:ring-2 focus:ring-emerald-600/40 dark:border-zinc-600"
                  checked={isActive}
                  onChange={(ev) => setIsActive(ev.target.checked)}
                  disabled={Boolean(saving)}
                />
                টেমপ্লেট সক্রিয়
              </label>
            </div>
            {approvalStatus === "REJECTED" ? (
              <label className={khLabelClass()}>
                প্রত্যাখ্যানের কারণ (সংরক্ষণ) <span className="text-rose-600">*</span>
                <textarea
                  value={rejectedReasonField}
                  onChange={(ev) => setRejectedReasonField(ev.target.value)}
                  className={khInputClass()}
                  rows={2}
                  disabled={Boolean(saving)}
                />
              </label>
            ) : null}
          </div>
        </SemenAdminFormCard>

        <SemenAdminFormCard
          id="semen-section-pricing"
          step={2}
          title="ডিফল্ট মূল্য"
          description="অফার মূল্য ও ছাড় % একসাথে পাঠাবেন না — ব্যাবসায়িক নিয়ম।"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className={khLabelClass()}>
              মূল মূল্য (৳) <span className="text-rose-600">*</span>
              <input
                required
                value={defaultBasePrice}
                onChange={(ev) => setDefaultBasePrice(ev.target.value)}
                className={khInputClass()}
                disabled={Boolean(saving)}
              />
            </label>
            <label className={khLabelClass()}>
              অফার মূল্য (৳)
              <input
                value={defaultOfferPrice}
                onChange={(ev) => setDefaultOfferPrice(ev.target.value)}
                className={khInputClass()}
                disabled={Boolean(saving)}
                placeholder="—"
              />
            </label>
            <label className={khLabelClass()}>
              ছাড় %
              <input
                value={defaultDiscountPercent}
                onChange={(ev) => setDefaultDiscountPercent(ev.target.value)}
                className={khInputClass()}
                disabled={Boolean(saving)}
                placeholder="—"
              />
            </label>
          </div>
        </SemenAdminFormCard>
      </div>

      <div className="pd-semen-section-row">
        <SemenAdminFormCard
          id="semen-section-breed"
          step={3}
          title="জাতের মিশ্রণ"
          description="প্রতিটি সারিতে জাত ও শতাংশ; যোগফল ১০০ হতে হবে। ভিজ্যুয়াল বার থেকে কম্পোজিশন দ্রুত বুঝুন।"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-medium text-zinc-600 dark:text-zinc-400">যোগফল</span>
              <AdminBadge variant={breedSumOk ? "success" : "danger"}>
                {breedSum.toFixed(2)}% / ১০০
              </AdminBadge>
              {!breedSumOk ? (
                <span className="text-[11px] text-amber-800 dark:text-amber-200">
                  সংরক্ষণের আগে ১০০-এ মিল করুন
                </span>
              ) : null}
            </div>
            <AdminActionButton
              type="button"
              variant="secondary"
              className="!gap-1 !px-2.5 !py-1.5 text-xs"
              onClick={addBreedRow}
              disabled={Boolean(saving)}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              লাইন
            </AdminActionButton>
          </div>
          <div className="space-y-2">
            {breedRows.map((row, i) => (
              <div
                key={row.clientKey}
                className="grid grid-cols-1 items-end gap-2 rounded-lg border border-zinc-200 bg-zinc-50/40 p-2 dark:border-zinc-700 dark:bg-zinc-900/30 sm:grid-cols-12 sm:gap-2 sm:p-2.5"
              >
                <label className={cn("sm:col-span-8", khLabelClass())}>
                  জাত
                  {breedsListBusy ? (
                    <FormAsyncControlSkeleton
                      label="জাতের তালিকা লোড হচ্ছে"
                      className={cn(khInputClass(), "pd-semen-form-select")}
                    />
                  ) : (
                    <select
                      value={row.breedId}
                      onChange={(ev) => setBreedRow(i, { breedId: ev.target.value })}
                      className={cn(khInputClass(), "pd-semen-form-select")}
                      disabled={breedSelectDisabled}
                    >
                      <option value="">নির্বাচন</option>
                      {breeds.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nameEn} / {b.nameBn}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
                <label className={cn("sm:col-span-2", khLabelClass())}>
                  %
                  {breedsListBusy ? (
                    <FormAsyncControlSkeleton label="শতাংশ" className={khInputClass()} />
                  ) : (
                    <input
                      value={row.percentage}
                      onChange={(ev) => setBreedRow(i, { percentage: ev.target.value })}
                      className={khInputClass()}
                      disabled={breedSelectDisabled}
                    />
                  )}
                </label>
                <div className="flex justify-end sm:col-span-2">
                  <AdminActionButton
                    type="button"
                    variant="ghost"
                    className="!p-2 text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                    disabled={Boolean(saving) || breedRows.length <= 1}
                    onClick={() => removeBreedRow(i)}
                    aria-label="জাতের সারি মুছুন"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </AdminActionButton>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 rounded-lg border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Composition visualization
            </p>
            {breedRows
              .filter((row) => row.breedId.trim() && Number(row.percentage) > 0)
              .map((row) => {
                const breed = breeds.find((b) => b.id === row.breedId);
                const pct = Number(row.percentage) || 0;
                return (
                  <div key={`${row.clientKey}-viz`} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-medium text-zinc-800 dark:text-zinc-100">
                        {breed ? `${breed.nameEn} / ${breed.nameBn}` : "নির্বাচিত জাত"}
                      </span>
                      <span className="tabular-nums text-zinc-600 dark:text-zinc-300">{pct.toFixed(2)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </SemenAdminFormCard>

        <SemenAdminFormCard
          id="semen-section-description"
          step={4}
          title="রিচ বিবরণ"
          description="বাজারে দেখানো প্রাইমারি কনটেন্ট — পরিষ্কার টাইপোগ্রাফি ও বড় এডিটিং সারফেস।"
        >
          <div className="pd-semen-rich-section">
            {/* Full Width: Detailed Description */}
            <div className="pd-semen-rich-full-width">
              <LazyRichTextEditor
                label="বিস্তারিত বিবরণ"
                labelHint="প্রধান পণ্যের বিবরণ — সবচেয়ে গুরুত্বপূর্ণ"
                value={detailedDescription}
                onChange={setDetailedDescription}
                disabled={Boolean(saving)}
                placeholder="পণ্যের সম্পূর্ণ বিবরণ লিখুন…"
                sizeVariant="large"
              />
            </div>
            {/* Stacked editors: Short Description + Benefits */}
            <div className="pd-semen-rich-two-col">
              <LazyRichTextEditor
                label="সংক্ষিপ্ত বিবরণ"
                labelHint="তালিকায় দেখানো হবে"
                value={shortDescription}
                onChange={setShortDescription}
                disabled={Boolean(saving)}
                placeholder="সংক্ষেপে লিখুন…"
                sizeVariant="default"
              />
              <LazyRichTextEditor
                label="উপকারিতা"
                labelHint="ক্রেতাদের জন্য মূল সুবিধা"
                value={expectedBenefits}
                onChange={setExpectedBenefits}
                disabled={Boolean(saving)}
                placeholder="উপকারিতা…"
                sizeVariant="default"
              />
            </div>
            {/* Stacked editors: Recommended Condition + Warnings */}
            <div className="pd-semen-rich-two-col">
              <LazyRichTextEditor
                label="সুপারিশকৃত প্রাণী অবস্থা"
                labelHint="কোন অবস্থায় ব্যবহার করবেন"
                value={recommendedAnimalCondition}
                onChange={setRecommendedAnimalCondition}
                disabled={Boolean(saving)}
                placeholder="কোন অবস্থায় সুপারিশ…"
                sizeVariant="default"
              />
              <LazyRichTextEditor
                label="সতর্কতা / প্রতিবন্ধক"
                labelHint="চিকিৎসা ঝুঁকি ও নিষেধাজ্ঞা"
                value={warningsContraindications}
                onChange={setWarningsContraindications}
                disabled={Boolean(saving)}
                placeholder="সতর্কতা…"
                sizeVariant="default"
              />
            </div>
          </div>
        </SemenAdminFormCard>
      </div>

        <SemenAdminFormCard
          id="semen-section-media"
          step={5}
          title="মিডিয়া"
          description="প্রোডাক্ট ইমেজ/ভিডিও যোগ করুন। বড় প্রিভিউ ও সহজ সাজানো।"
        >
          <LazyGalleryUploader
            mediaRows={mediaRows}
            setMediaRow={setMediaRow}
            removeMediaRow={removeMediaRow}
            addMediaRow={addMediaRow}
            onMediaKindChange={onMediaKindChange}
            saving={saving}
            disabled={approvalBusy}
            onBusy={onMediaSectionBusy}
            onError={onMediaSectionError}
            swapMediaAdjacent={swapMediaAdjacent}
            density="compact"
          />
        </SemenAdminFormCard>

        <SemenAdminFormCard
          id="semen-section-metadata"
          step={6}
          title="ট্যাগ ও মেটাডেটা"
          description="কী–মান সারি থেকে JSON তৈরি হবে। সারি খালি থাকলে null সংরক্ষিত হবে।"
        >
          <MetadataBuilder valueJson={tagsJsonText} onChange={setTagsJsonText} disabled={Boolean(saving)} />
        </SemenAdminFormCard>

        <SemenAdminFormCard title="প্রকাশ সেটিংস" description="স্ট্যাটাস, অনুমোদন এবং প্রকাশ সিদ্ধান্ত।">
          <div className="space-y-3">
            <label className={khLabelClass()}>
              অনুমোদন স্ট্যাটাস
              <select
                value={approvalStatus}
                onChange={(ev) => {
                  const v = ev.target.value as SemenTemplateApprovalStatusValue;
                  setApprovalStatus(v);
                  if (v !== "REJECTED") setRejectedReasonField("");
                }}
                className={cn(khInputClass(), "pd-semen-form-select")}
                disabled={Boolean(saving)}
              >
                {SEMEN_TEMPLATE_APPROVAL_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            {props.mode === "edit" ? (
              <div className="flex flex-wrap gap-2">
                <AdminActionButton
                  type="button"
                  variant="primary"
                  className="!px-3 !py-2 text-xs sm:text-sm"
                  disabled={Boolean(approvalBusy || saving)}
                  onClick={() => void onApprove("APPROVE")}
                >
                  অনুমোদন
                </AdminActionButton>
                <AdminActionButton
                  type="button"
                  variant="secondary"
                  className="!px-3 !py-2 text-xs sm:text-sm"
                  disabled={Boolean(approvalBusy || saving)}
                  onClick={() => setRejectOpen((v) => !v)}
                >
                  প্রত্যাখ্যান
                </AdminActionButton>
              </div>
            ) : null}

            {props.mode === "edit" && rejectOpen ? (
              <div className="space-y-2 rounded-lg border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                <label className={khLabelClass()}>
                  প্রত্যাখ্যানের কারণ
                  <textarea
                    value={rejectedReasonField}
                    onChange={(ev) => setRejectedReasonField(ev.target.value)}
                    className={khInputClass()}
                    rows={2}
                  />
                </label>
                <AdminActionButton
                  type="button"
                  variant="primary"
                  className="!px-3 !py-2 text-xs"
                  disabled={approvalBusy}
                  onClick={() => void onApprove("REJECT")}
                >
                  নিশ্চিত প্রত্যাখ্যান
                </AdminActionButton>
              </div>
            ) : null}

            {auditMeta ? (
              <dl className="grid gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900/40">
                <div>
                  <dt className="font-medium text-zinc-500 dark:text-zinc-400">Template ID</dt>
                  <dd className="mt-0.5 font-mono break-all">{auditMeta.id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-500 dark:text-zinc-400">তৈরি</dt>
                  <dd className="mt-0.5">
                    {new Date(auditMeta.createdAt).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-zinc-500 dark:text-zinc-400">হালনাগাদ</dt>
                  <dd className="mt-0.5">
                    {new Date(auditMeta.updatedAt).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}
                  </dd>
                </div>
              </dl>
            ) : null}
          </div>
        </SemenAdminFormCard>

        <FormBottomActions
          isDirty={isDirty}
          blockingIssuesCount={blockingIssues.length}
          saveDisabled={saveDisabled}
          saving={saving}
          onSaveDraft={handleSaveDraft}
          onSaveContinue={handleSaveContinue}
          onPublish={handlePublishIntent}
          onBackToTop={handleBackToTop}
        />
      </div>
    </div>
  </div>
    </form>
  );
}
