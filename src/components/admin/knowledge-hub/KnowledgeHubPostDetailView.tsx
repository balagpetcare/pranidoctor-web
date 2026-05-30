"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";

import { KnowledgeHubStatusBadge } from "./KnowledgeHubStatusBadge";
import { khInputClass, khLabelClass } from "./styles";

export type AdminTutorialDetail = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string;
  coverImageUrl: string | null;
  approvalStatus: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  publishedAt: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    nameBn: string;
    nameEn: string | null;
    slug: string;
  };
  author: {
    userId: string;
    role: string;
    displayName: string | null;
  };
};

export function KnowledgeHubPostDetailView({ postId }: { postId: string }) {
  const router = useRouter();
  const [loadRetryKey, setLoadRetryKey] = useState(0);
  const [meId, setMeId] = useState<string | null>(null);
  const [tutorial, setTutorial] = useState<AdminTutorialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  const loadMe = useCallback(async () => {
    try {
      const data = await readAdminJson<{ user: { id: string } }>(
        await adminFetch("/api/admin/auth/me"),
      );
      setMeId(data.user.id);
    } catch {
      setMeId(null);
    }
  }, []);

  const loadTutorial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{ tutorial: AdminTutorialDetail }>(
        await adminFetch(`/api/admin/tutorials/${postId}`),
      );
      setTutorial(data.tutorial);
    } catch (e) {
      setError(e instanceof Error ? e.message : "লোড করা যায়নি");
      setTutorial(null);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
     
    void loadMe();
  }, [loadMe]);

  useEffect(() => {
     
    void loadTutorial();
  }, [loadTutorial, loadRetryKey]);

  async function postAction(path: string, body?: object) {
    setBusy(path);
    setError(null);
    try {
      await readAdminJson<{ tutorial: AdminTutorialDetail }>(
        await adminFetch(`/api/admin/tutorials/${postId}/${path}`, {
          method: "POST",
          headers: body ? { "Content-Type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        }),
      );
      await loadTutorial();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "কাজটি ব্যর্থ");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <AdminLoadingState message="টিউটোরিয়াল লোড হচ্ছে…" />;
  }

  if (error && !tutorial) {
    return (
      <AdminErrorState
        message={error}
        onRetry={() => setLoadRetryKey((k) => k + 1)}
      />
    );
  }

  if (!tutorial) return null;

  const isAuthor = meId != null && tutorial.author.userId === meId;
  const editable =
    isAuthor &&
    (tutorial.approvalStatus === "DRAFT" ||
      tutorial.approvalStatus === "PENDING_REVIEW" ||
      tutorial.approvalStatus === "REJECTED");
  const canSubmit =
    isAuthor &&
    (tutorial.approvalStatus === "DRAFT" || tutorial.approvalStatus === "REJECTED");
  const canModerate = tutorial.approvalStatus === "PENDING_REVIEW";

  const headerActions = (
    <div className="flex flex-wrap gap-2">
      <AdminActionButton href="/admin/knowledge-hub/posts" variant="secondary">
        তালিকায় ফিরুন
      </AdminActionButton>
      {editable ? (
        <AdminActionButton
          href={`/admin/knowledge-hub/posts/${postId}/edit`}
          variant="primary"
        >
          সম্পাদনা
        </AdminActionButton>
      ) : null}
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6" lang="bn">
      {error ? (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      ) : null}

      <AdminPageHeader
        title={tutorial.title}
        description={
          <div className="flex flex-wrap items-center gap-2">
            <KnowledgeHubStatusBadge status={tutorial.approvalStatus} />
            {tutorial.isPublished ? (
              <AdminBadge variant="success" className="font-normal">
                প্রকাশিত
              </AdminBadge>
            ) : null}
            <span className="block w-full text-sm text-zinc-600 dark:text-zinc-400">
              ক্যাটাগরি: {tutorial.category.nameBn}{" "}
              <span className="font-mono text-xs">({tutorial.category.slug})</span>
              {" · "}
              লেখক: {tutorial.author.displayName ?? "—"} ({tutorial.author.role}) ·{" "}
              <span className="font-mono text-xs">{tutorial.author.userId}</span>
              {" · "}
              <span className="font-mono text-xs">স্লাগ: {tutorial.slug}</span>
            </span>
          </div>
        }
        actions={headerActions}
      />

      {tutorial.rejectionReason ? (
        <AdminFormSection
          title="প্রত্যাখ্যানের কারণ"
          className="border-rose-200 bg-rose-50/80 dark:border-rose-900/50 dark:bg-rose-950/30"
        >
          <p className="text-sm text-rose-900 dark:text-rose-100">{tutorial.rejectionReason}</p>
        </AdminFormSection>
      ) : null}

      {tutorial.summary ? (
        <AdminFormSection title="সারাংশ">
          <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
            {tutorial.summary}
          </p>
        </AdminFormSection>
      ) : null}

      {tutorial.coverImageUrl ? (
        <AdminFormSection title="কভার ছবি">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin URL field */}
          <img
            src={tutorial.coverImageUrl}
            alt=""
            className="max-h-64 w-auto rounded-lg border border-zinc-200 dark:border-zinc-700"
          />
        </AdminFormSection>
      ) : null}

      <AdminFormSection title="বিষয়বস্তু">
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {tutorial.body}
        </div>
      </AdminFormSection>

      <AdminFormSection
        title="কর্ম"
        description="খসড়া জমা দিন, বা পর্যালোচনায় অনুমোদন / প্রত্যাখ্যান করুন।"
      >
        <div className="flex flex-wrap gap-2">
          {canSubmit ? (
            <AdminActionButton
              type="button"
              variant="primary"
              disabled={busy !== null}
              onClick={() => void postAction("submit")}
            >
              {busy === "submit" ? "…" : "পর্যালোচনার জন্য জমা দিন"}
            </AdminActionButton>
          ) : null}
          {canModerate ? (
            <>
              <AdminActionButton
                type="button"
                variant="primary"
                disabled={busy !== null}
                onClick={() => void postAction("approve")}
              >
                {busy === "approve" ? "…" : "অনুমোদন করুন"}
              </AdminActionButton>
              <AdminActionButton
                type="button"
                variant="danger"
                disabled={busy !== null}
                onClick={() => setShowReject((s) => !s)}
              >
                প্রত্যাখ্যান
              </AdminActionButton>
            </>
          ) : null}
        </div>

        {showReject && canModerate ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const r = rejectReason.trim();
              if (!r) return;
              void (async () => {
                await postAction("reject", { reason: r });
                setRejectReason("");
                setShowReject(false);
              })();
            }}
            className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-700"
          >
            <label className={khLabelClass()}>
              প্রত্যাখ্যানের কারণ <span className="text-rose-600">*</span>
              <textarea
                required
                value={rejectReason}
                onChange={(ev) => setRejectReason(ev.target.value)}
                rows={3}
                className={khInputClass()}
              />
            </label>
            <AdminActionButton
              type="submit"
              variant="danger"
              disabled={busy !== null}
            >
              {busy === "reject" ? "…" : "প্রত্যাখ্যান নিশ্চিত করুন"}
            </AdminActionButton>
          </form>
        ) : null}

        {!isAuthor && tutorial.approvalStatus === "PENDING_REVIEW" ? (
          <p className="text-xs text-zinc-500">
            ডাক্তার বা অন্য অ্যাডমিনের লেখা — আপনি অনুমোদন বা প্রত্যাখ্যান করতে পারেন।
          </p>
        ) : null}
      </AdminFormSection>
    </div>
  );
}
