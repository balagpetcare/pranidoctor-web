"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { DoctorKhStatusBadge } from "@/components/doctor/knowledge-hub/DoctorKhStatusBadge";
import {
  dkBtnPrimaryClass,
  dkBtnSecondaryClass,
  dkCardClass,
} from "@/components/doctor/knowledge-hub/styles";
import { doctorFetch } from "@/lib/doctor/doctor-fetch";
import { readDoctorJson } from "@/lib/doctor/read-doctor-json";
import { cn } from "@/lib/cn";

export type DoctorTutorialDetail = {
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

export function DoctorKhPostDetail({ postId }: { postId: string }) {
  const router = useRouter();
  const [tutorial, setTutorial] = useState<DoctorTutorialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadTutorial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await readDoctorJson<{ tutorial: DoctorTutorialDetail }>(
        await doctorFetch(`/api/doctor/tutorials/${postId}`),
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void loadTutorial();
  }, [loadTutorial]);

  async function submitForReview() {
    if (
      !window.confirm(
        "আপনি কি নিশ্চিত যে এই লেখাটি অ্যাডমিন পর্যালোচনার জন্য জমা দিতে চান? জমা দিলে আর সম্পাদনা সীমিত হতে পারে।",
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await readDoctorJson<{ tutorial: DoctorTutorialDetail }>(
        await doctorFetch(`/api/doctor/tutorials/${postId}/submit`, {
          method: "POST",
        }),
      );
      await loadTutorial();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "জমা ব্যর্থ");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400" lang="bn">
        লোড হচ্ছে…
      </p>
    );
  }

  if (error && !tutorial) {
    return (
      <p className="text-sm text-rose-600 dark:text-rose-400" lang="bn">
        {error}
      </p>
    );
  }

  if (!tutorial) return null;

  const editable =
    tutorial.approvalStatus === "DRAFT" ||
    tutorial.approvalStatus === "PENDING_REVIEW" ||
    tutorial.approvalStatus === "REJECTED";
  const canSubmit =
    tutorial.approvalStatus === "DRAFT" || tutorial.approvalStatus === "REJECTED";

  return (
    <div className="mx-auto max-w-4xl space-y-6" lang="bn">
      {error ? (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <DoctorKhStatusBadge status={tutorial.approvalStatus} />
            {tutorial.isPublished ? (
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-900 dark:bg-teal-950/50 dark:text-teal-100">
                প্রকাশিত (অ্যাপে)
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {tutorial.title}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            বিভাগ: {tutorial.category.nameBn}{" "}
            <span className="font-mono text-xs">({tutorial.category.slug})</span>
          </p>
          <p className="font-mono text-xs text-zinc-500">স্লাগ: {tutorial.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/doctor/knowledge-hub/posts" className={dkBtnSecondaryClass()}>
            তালিকা
          </Link>
          {editable ? (
            <Link
              href={`/doctor/knowledge-hub/posts/${postId}/edit`}
              className={dkBtnPrimaryClass()}
            >
              সম্পাদনা
            </Link>
          ) : null}
        </div>
      </div>

      {tutorial.rejectionReason ? (
        <div
          className={cn(
            dkCardClass(),
            "border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/30",
          )}
        >
          <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">
            প্রত্যাখ্যানের কারণ (অ্যাডমিন)
          </p>
          <p className="mt-1 text-sm text-rose-800 dark:text-rose-200">
            {tutorial.rejectionReason}
          </p>
        </div>
      ) : null}

      {tutorial.approvalStatus === "PENDING_REVIEW" ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">
          এই লেখাটি অ্যাডমিন পর্যালোচনার অপেক্ষায় আছে। অনুমোদন শুধুমাত্র অ্যাডমিন প্যানেল থেকে হয়।
        </p>
      ) : null}

      {tutorial.summary ? (
        <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          {tutorial.summary}
        </p>
      ) : null}

      {tutorial.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={tutorial.coverImageUrl}
          alt=""
          className="max-h-64 w-auto rounded-lg border border-zinc-200 dark:border-zinc-700"
        />
      ) : null}

      <div className={cn(dkCardClass(), "whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200")}>
        {tutorial.body}
      </div>

      {canSubmit ? (
        <div className={cn(dkCardClass(), "space-y-2")}>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">জমা দিন</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submitForReview()}
            className={dkBtnPrimaryClass()}
          >
            {busy ? "…" : "পর্যালোচনার জন্য জমা দিন"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
