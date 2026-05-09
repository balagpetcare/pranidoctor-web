"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { cn } from "@/lib/cn";

import type { AdminContentCategoryRow } from "./KnowledgeHubCategoriesList";
import type { AdminTutorialDetail } from "./KnowledgeHubPostDetailView";
import { khInputClass, khLabelClass } from "./styles";

type Props =
  | { mode: "create" }
  | { mode: "edit"; postId: string };

export function KnowledgeHubPostForm(props: Props) {
  const router = useRouter();
  const editPostId = props.mode === "edit" ? props.postId : "";
  const [loadRetryKey, setLoadRetryKey] = useState(0);
  const [categories, setCategories] = useState<AdminContentCategoryRow[]>([]);
  const [loading, setLoading] = useState(props.mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      const data = await readAdminJson<{ categories: AdminContentCategoryRow[] }>(
        await adminFetch("/api/admin/content-categories"),
      );
      setCategories(data.categories);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadPost = useCallback(async () => {
    if (props.mode !== "edit") return;
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{ tutorial: AdminTutorialDetail }>(
        await adminFetch(`/api/admin/tutorials/${editPostId}`),
      );
      const t = data.tutorial;
      setTitle(t.title);
      setSlug(t.slug);
      setSummary(t.summary ?? "");
      setBody(t.body);
      setCoverImageUrl(t.coverImageUrl ?? "");
      setCategoryId(t.category.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [props.mode, editPostId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after network
    void loadPost();
  }, [loadPost, loadRetryKey]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      summary: summary.trim() || null,
      body,
      coverImageUrl: coverImageUrl.trim() || null,
      categoryId,
    };

    try {
      if (props.mode === "create") {
        await readAdminJson<{ tutorial: { id: string } }>(
          await adminFetch("/api/admin/tutorials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        router.push("/admin/knowledge-hub/posts");
        router.refresh();
      } else {
        await readAdminJson<{ tutorial: unknown }>(
          await adminFetch(`/api/admin/tutorials/${editPostId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        router.push(`/admin/knowledge-hub/posts/${props.postId}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <AdminLoadingState message="পোস্ট লোড হচ্ছে…" />;
  }

  if (props.mode === "edit" && error && !title) {
    return (
      <AdminErrorState
        message={error}
        onRetry={() => setLoadRetryKey((k) => k + 1)}
      />
    );
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="mx-auto max-w-3xl space-y-6"
      lang="bn"
    >
      {error ? (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      ) : null}

      <AdminFormSection title="শিরোনাম ও স্লাগ" description="টিউটোরিয়াল চিহ্নিতকরণ।">
        <label className={khLabelClass()}>
          শিরোনাম <span className="text-rose-600">*</span>
          <input required value={title} onChange={(ev) => setTitle(ev.target.value)} className={khInputClass()} />
        </label>

        <label className={khLabelClass()}>
          স্লাগ <span className="text-rose-600">*</span>
          <input
            required
            value={slug}
            onChange={(ev) => setSlug(ev.target.value)}
            className={cn(khInputClass(), "font-mono text-xs")}
          />
        </label>
      </AdminFormSection>

      <AdminFormSection title="ক্যাটাগরি ও সারাংশ">
        <label className={khLabelClass()}>
          ক্যাটাগরি <span className="text-rose-600">*</span>
          <select
            required
            value={categoryId}
            onChange={(ev) => setCategoryId(ev.target.value)}
            className={khInputClass()}
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

        <label className={khLabelClass()}>
          সারাংশ
          <textarea
            value={summary}
            onChange={(ev) => setSummary(ev.target.value)}
            rows={2}
            className={khInputClass()}
          />
        </label>
      </AdminFormSection>

      <AdminFormSection title="বিষয়বস্তু" description="মূল টিউটোরিয়াল টেক্সট।">
        <label className={khLabelClass()}>
          বিষয়বস্তু <span className="text-rose-600">*</span>
          <textarea
            required
            value={body}
            onChange={(ev) => setBody(ev.target.value)}
            rows={14}
            className={khInputClass()}
          />
        </label>
      </AdminFormSection>

      <AdminFormSection title="কভার ছবি (ঐচ্ছিক)">
        <label className={khLabelClass()}>
          কভার ছবির URL
          <input
            type="url"
            value={coverImageUrl}
            onChange={(ev) => setCoverImageUrl(ev.target.value)}
            className={khInputClass()}
            placeholder="https://"
          />
        </label>
      </AdminFormSection>

      <div className="flex flex-wrap gap-3">
        <AdminActionButton type="submit" variant="primary" disabled={saving}>
          {saving ? "সংরক্ষণ…" : "সংরক্ষণ করুন"}
        </AdminActionButton>
        <AdminActionButton
          href={
            props.mode === "create"
              ? "/admin/knowledge-hub/posts"
              : `/admin/knowledge-hub/posts/${editPostId}`
          }
          variant="secondary"
        >
          বাতিল
        </AdminActionButton>
      </div>
    </form>
  );
}
