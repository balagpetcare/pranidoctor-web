"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { MobileTutorialCategory } from "@/components/doctor/knowledge-hub/DoctorKhPostsList";
import type { DoctorTutorialDetail } from "@/components/doctor/knowledge-hub/DoctorKhPostDetail";
import {
  dkBtnPrimaryClass,
  dkBtnSecondaryClass,
  dkCardClass,
  dkInputClass,
  dkLabelClass,
} from "@/components/doctor/knowledge-hub/styles";
import { doctorFetch } from "@/lib/doctor/doctor-fetch";
import { readDoctorJson } from "@/lib/doctor/read-doctor-json";
import { slugifyLatinFromTitle } from "@/lib/knowledge-hub/slugify-latin";
import { cn } from "@/lib/cn";

type Props =
  | { mode: "create" }
  | { mode: "edit"; postId: string };

export function DoctorKhPostForm(props: Props) {
  const router = useRouter();
  const editPostId = props.mode === "edit" ? props.postId : "";

  const [categories, setCategories] = useState<MobileTutorialCategory[]>([]);
  const [loading, setLoading] = useState(props.mode === "edit");
  const [saving, setSaving] = useState<"idle" | "draft" | "submit">("idle");
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(false);
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [readOnlyReason, setReadOnlyReason] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/mobile/tutorials/categories", {
        credentials: "same-origin",
      });
      const parsed = (await res.json()) as
        | { ok: true; data: { categories: MobileTutorialCategory[] } }
        | { ok: false };
      if (parsed.ok && "data" in parsed) {
        setCategories(parsed.data.categories);
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    }
  }, []);

  const loadPost = useCallback(async () => {
    if (props.mode !== "edit") return;
    setLoading(true);
    setError(null);
    try {
      const data = await readDoctorJson<{ tutorial: DoctorTutorialDetail }>(
        await doctorFetch(`/api/doctor/tutorials/${editPostId}`),
      );
      const t = data.tutorial;
      if (t.approvalStatus === "APPROVED") {
        setReadOnlyReason(
          "এই পোস্টটি ইতিমধ্যে অনুমোদিত। সম্পাদনা করা যায় না।",
        );
      } else {
        setReadOnlyReason(null);
      }
      setTitle(t.title);
      setSlug(t.slug);
      setAutoSlug(false);
      setSummary(t.summary ?? "");
      setBody(t.body);
      setCoverImageUrl(t.coverImageUrl ?? "");
      setCategoryId(t.category.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [editPostId, props.mode]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void loadPost();
  }, [loadPost]);

  function onTitleBlur() {
    if (!autoSlug) return;
    const s = slugifyLatinFromTitle(title);
    if (s) setSlug(s);
  }

  function buildPayload() {
    return {
      title: title.trim(),
      slug: slug.trim(),
      summary: summary.trim() || null,
      body,
      coverImageUrl: coverImageUrl.trim() || null,
      categoryId,
    };
  }

  async function saveDraft(e: React.FormEvent) {
    e.preventDefault();
    setSaving("draft");
    setError(null);
    const payload = buildPayload();

    try {
      if (props.mode === "create") {
        const data = await readDoctorJson<{ tutorial: { id: string } }>(
          await doctorFetch("/api/doctor/tutorials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        router.push(`/doctor/knowledge-hub/posts/${data.tutorial.id}`);
        router.refresh();
      } else {
        await readDoctorJson<{ tutorial: unknown }>(
          await doctorFetch(`/api/doctor/tutorials/${editPostId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        router.push(`/doctor/knowledge-hub/posts/${editPostId}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ");
    } finally {
      setSaving("idle");
    }
  }

  async function saveAndSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !window.confirm(
        "অ্যাডমিন পর্যালোচনার জন্য জমা দিতে চান? অনুমোদন শুধুমাত্র অ্যাডমিন করবেন।",
      )
    ) {
      return;
    }
    setSaving("submit");
    setError(null);
    const payload = buildPayload();

    try {
      if (props.mode === "create") {
        const data = await readDoctorJson<{ tutorial: { id: string } }>(
          await doctorFetch("/api/doctor/tutorials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        const id = data.tutorial.id;
        await readDoctorJson<{ tutorial: unknown }>(
          await doctorFetch(`/api/doctor/tutorials/${id}/submit`, {
            method: "POST",
          }),
        );
        router.push(`/doctor/knowledge-hub/posts/${id}`);
        router.refresh();
      } else {
        await readDoctorJson<{ tutorial: unknown }>(
          await doctorFetch(`/api/doctor/tutorials/${editPostId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        await readDoctorJson<{ tutorial: unknown }>(
          await doctorFetch(`/api/doctor/tutorials/${editPostId}/submit`, {
            method: "POST",
          }),
        );
        router.push(`/doctor/knowledge-hub/posts/${editPostId}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "জমা ব্যর্থ");
    } finally {
      setSaving("idle");
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400" lang="bn">
        লোড হচ্ছে…
      </p>
    );
  }

  if (readOnlyReason) {
    return (
      <div className={cn(dkCardClass(), "max-w-3xl space-y-4")} lang="bn">
        <p className="text-sm text-zinc-800 dark:text-zinc-200">{readOnlyReason}</p>
        <Link href={`/doctor/knowledge-hub/posts/${editPostId}`} className={dkBtnPrimaryClass()}>
          বিস্তারিত দেখুন
        </Link>
      </div>
    );
  }

  return (
    <form className={cn(dkCardClass(), "max-w-3xl space-y-4")} lang="bn">
      {error ? (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      ) : null}

      <label className={dkLabelClass()}>
        শিরোনাম <span className="text-rose-600">*</span>
        <input
          required
          value={title}
          onChange={(ev) => setTitle(ev.target.value)}
          onBlur={onTitleBlur}
          className={dkInputClass()}
        />
      </label>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className={cn(dkLabelClass(), "flex items-center gap-2 sm:shrink-0")}>
          <input
            type="checkbox"
            checked={autoSlug}
            onChange={(ev) => setAutoSlug(ev.target.checked)}
            className="h-4 w-4 rounded border-zinc-400"
          />
          স্লাগ স্বয়ংক্রিয় (ল্যাটিন শিরোনাম)
        </label>
      </div>

      <label className={dkLabelClass()}>
        স্লাগ (ইংরেজি ছোট হাতের, হাইফেন) <span className="text-rose-600">*</span>
        <input
          required
          value={slug}
          onChange={(ev) => setSlug(ev.target.value)}
          className={cn(dkInputClass(), "font-mono text-xs")}
          placeholder="my-tutorial-slug"
        />
      </label>

      <label className={dkLabelClass()}>
        বিভাগ <span className="text-rose-600">*</span>
        <select
          required
          value={categoryId}
          onChange={(ev) => setCategoryId(ev.target.value)}
          className={dkInputClass()}
        >
          <option value="" disabled>
            নির্বাচন করুন
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameBn}
            </option>
          ))}
        </select>
      </label>

      <label className={dkLabelClass()}>
        সারাংশ
        <textarea
          value={summary}
          onChange={(ev) => setSummary(ev.target.value)}
          rows={2}
          className={dkInputClass()}
        />
      </label>

      <label className={dkLabelClass()}>
        বিষয়বস্তু <span className="text-rose-600">*</span>
        <textarea
          required
          value={body}
          onChange={(ev) => setBody(ev.target.value)}
          rows={14}
          className={dkInputClass()}
        />
      </label>

      <label className={dkLabelClass()}>
        কভার ছবির URL (ঐচ্ছিক)
        <input
          value={coverImageUrl}
          onChange={(ev) => setCoverImageUrl(ev.target.value)}
          className={dkInputClass()}
          placeholder="https://"
        />
      </label>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          disabled={saving !== "idle"}
          onClick={(e) => void saveDraft(e)}
          className={dkBtnSecondaryClass()}
        >
          {saving === "draft" ? "সংরক্ষণ…" : "খসড়া সংরক্ষণ"}
        </button>
        <button
          type="button"
          disabled={saving !== "idle"}
          onClick={(e) => void saveAndSubmit(e)}
          className={dkBtnPrimaryClass()}
        >
          {saving === "submit" ? "জমা হচ্ছে…" : "পর্যালোচনার জন্য জমা দিন"}
        </button>
        <Link
          href={
            props.mode === "create"
              ? "/doctor/knowledge-hub/posts"
              : `/doctor/knowledge-hub/posts/${editPostId}`
          }
          className={dkBtnSecondaryClass()}
        >
          বাতিল
        </Link>
      </div>
    </form>
  );
}
