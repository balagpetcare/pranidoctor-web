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
import { khInputClass, khLabelClass } from "./styles";

type Props =
  | { mode: "create" }
  | { mode: "edit"; categoryId: string };

export function KnowledgeHubCategoryForm(props: Props) {
  const router = useRouter();
  const categoryId = props.mode === "edit" ? props.categoryId : "";
  const [loadRetryKey, setLoadRetryKey] = useState(0);
  const [loading, setLoading] = useState(props.mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const load = useCallback(async () => {
    if (props.mode !== "edit") return;
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{ category: AdminContentCategoryRow }>(
        await adminFetch(`/api/admin/content-categories/${categoryId}`),
      );
      const c = data.category;
      setNameBn(c.nameBn);
      setNameEn(c.nameEn ?? "");
      setSlug(c.slug);
      setDescription(c.description ?? "");
      setSortOrder(String(c.sortOrder));
      setIsActive(c.isActive);
    } catch (e) {
      setError(e instanceof Error ? e.message : "লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [props.mode, categoryId]);

  useEffect(() => {
     
    void load();
  }, [load, loadRetryKey]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        nameBn: nameBn.trim(),
        nameEn: nameEn.trim() || null,
        slug: slug.trim(),
        description: description.trim() || null,
        sortOrder: Number(sortOrder) || 0,
        isActive,
      };

      if (props.mode === "create") {
        await readAdminJson<{ category: { id: string } }>(
          await adminFetch("/api/admin/content-categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        router.push("/admin/knowledge-hub/categories");
        router.refresh();
      } else {
        await readAdminJson<{ category: unknown }>(
          await adminFetch(`/api/admin/content-categories/${categoryId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        router.push("/admin/knowledge-hub/categories");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <AdminLoadingState message="ক্যাটাগরি লোড হচ্ছে…" />;
  }

  if (props.mode === "edit" && error && !nameBn) {
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
      className="mx-auto max-w-2xl space-y-6"
      lang="bn"
    >
      {error ? (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      ) : null}

      <AdminFormSection title="ক্যাটাগরি নাম" description="বাংলা ও ইংরেজি লেবেল।">
        <label className={khLabelClass()}>
          নাম (বাংলা) <span className="text-rose-600">*</span>
          <input
            required
            value={nameBn}
            onChange={(ev) => setNameBn(ev.target.value)}
            className={khInputClass()}
          />
        </label>

        <label className={khLabelClass()}>
          নাম (English)
          <input
            value={nameEn}
            onChange={(ev) => setNameEn(ev.target.value)}
            className={khInputClass()}
          />
        </label>
      </AdminFormSection>

      <AdminFormSection title="স্লাগ ও বিবরণ">
        <label className={khLabelClass()}>
          স্লাগ (ইংরেজি ছোট হাতের, হাইফেন) <span className="text-rose-600">*</span>
          <input
            required
            value={slug}
            onChange={(ev) => setSlug(ev.target.value)}
            className={cn(khInputClass(), "font-mono text-xs")}
            placeholder="gorur-rog"
          />
        </label>

        <label className={khLabelClass()}>
          বিবরণ
          <textarea
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            rows={3}
            className={khInputClass()}
          />
        </label>
      </AdminFormSection>

      <AdminFormSection title="তালিকায় সাজানো ও প্রকাশ">
        <label className={khLabelClass()}>
          সাজানোর ক্রম (সংখ্যা)
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(ev) => setSortOrder(ev.target.value)}
            className={khInputClass()}
          />
        </label>

        <label className={cn(khLabelClass(), "flex items-center gap-2")}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(ev) => setIsActive(ev.target.checked)}
            className="h-4 w-4 rounded border-zinc-400"
          />
          সক্রিয় (মোবাইল অ্যাপে দেখাবে)
        </label>
      </AdminFormSection>

      <div className="flex flex-wrap gap-3">
        <AdminActionButton type="submit" variant="primary" disabled={saving}>
          {saving ? "সংরক্ষণ…" : "সংরক্ষণ করুন"}
        </AdminActionButton>
        <AdminActionButton href="/admin/knowledge-hub/categories" variant="secondary">
          বাতিল
        </AdminActionButton>
      </div>
    </form>
  );
}
