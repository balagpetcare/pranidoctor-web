"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { AreaType } from "@/generated/prisma/browser";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { cn } from "@/lib/cn";
import type { AdminAreaRow } from "@/types/admin-areas";

import { areaTypeBn } from "./area-labels";
import { filterParentCandidates, formatAreaOptionLabel } from "./parent-options";

const AREA_TYPES = [
  AreaType.DIVISION,
  AreaType.DISTRICT,
  AreaType.UPAZILA,
  AreaType.UNION,
  AreaType.VILLAGE,
  AreaType.SERVICE_AREA,
] as const;

function inputClassName(): string {
  return cn(
    "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
    "outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2",
    "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  );
}

function slugifyHint(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export type AreaFormProps = {
  mode: "create" | "edit";
  areaId?: string;
};

export function AreaForm({ mode, areaId }: AreaFormProps) {
  const router = useRouter();
  const [loadingArea, setLoadingArea] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadRetryKey, setLoadRetryKey] = useState(0);

  const [parentOptions, setParentOptions] = useState<AdminAreaRow[]>([]);

  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [slug, setSlug] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<AreaType>(AreaType.DIVISION);
  const [parentId, setParentId] = useState<string>("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await readAdminJson<{ areas: AdminAreaRow[] }>(
          await adminFetch(`/api/admin/areas?limit=500`),
        );
        if (!cancelled) setParentOptions(data.areas);
      } catch {
        if (!cancelled) setParentOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !areaId) return;
    let cancelled = false;
    void (async () => {
      setLoadingArea(true);
      setLoadError(null);
      try {
        const data = await readAdminJson<{ area: AdminAreaRow }>(
          await adminFetch(`/api/admin/areas/${areaId}`),
        );
        if (cancelled) return;
        const a = data.area;
        setName(a.name);
        setNameBn(a.nameBn ?? "");
        setSlug(a.slug);
        setCode(a.code ?? "");
        setType(a.type);
        setParentId(a.parentId ?? "");
        setSortOrder(String(a.sortOrder));
        setIsActive(a.isActive);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Could not load area");
        }
      } finally {
        if (!cancelled) setLoadingArea(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, areaId, loadRetryKey]);

  const alwaysIncludeParentIds = useMemo(
    () => (parentId ? new Set<string>([parentId]) : undefined),
    [parentId],
  );

  const parentSelectOptions = useMemo(
    () =>
      filterParentCandidates(
        type,
        parentOptions,
        areaId,
        alwaysIncludeParentIds,
      ),
    [type, parentOptions, areaId, alwaysIncludeParentIds],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const slugTrim = slug.trim();
    const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRe.test(slugTrim)) {
      setFormError(
        "Slug must use lowercase letters, numbers, and hyphens only (e.g. dhaka-district-area).",
      );
      return;
    }

    const sortParsed = Number.parseInt(sortOrder, 10);
    if (!Number.isFinite(sortParsed)) {
      setFormError("Sort order must be a whole number.");
      return;
    }

    const nameBnPayload =
      nameBn.trim() === "" ? null : nameBn.trim();

    const createBody = {
      name: name.trim(),
      ...(nameBnPayload === null
        ? {}
        : { nameBn: nameBnPayload }),
      slug: slugTrim,
      ...(code.trim() === "" ? {} : { code: code.trim() }),
      type,
      parentId: parentId === "" ? null : parentId,
      sortOrder: sortParsed,
    };

    const patchBody = {
      name: name.trim(),
      nameBn: nameBnPayload,
      slug: slugTrim,
      code: code.trim() === "" ? null : code.trim(),
      type,
      parentId: parentId === "" ? null : parentId,
      sortOrder: sortParsed,
      isActive,
    };

    setSaving(true);
    try {
      if (mode === "create") {
        await readAdminJson<{ area: AdminAreaRow }>(
          await adminFetch("/api/admin/areas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createBody),
          }),
        );
      } else if (areaId) {
        await readAdminJson<{ area: AdminAreaRow }>(
          await adminFetch(`/api/admin/areas/${areaId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patchBody),
          }),
        );
      }
      router.push("/admin/areas");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loadingArea) {
    return <AdminLoadingState message="এলাকার তথ্য লোড হচ্ছে…" />;
  }

  if (mode === "edit" && loadError) {
    return (
      <div className="space-y-4">
        <AdminErrorState
          message={loadError}
          onRetry={() => setLoadRetryKey((k) => k + 1)}
        />
        <AdminActionButton href="/admin/areas" variant="secondary">
          ← এলাকা তালিকা
        </AdminActionButton>
      </div>
    );
  }

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="space-y-6">
      {formError ? (
        <AdminErrorState title="সংরক্ষণ ব্যর্থ" message={formError} />
      ) : null}

      <AdminFormSection
        title="নাম ও শনাক্তকরণ"
        description="ইংরেজি ও বাংলা নাম, স্লাগ ও ঐচ্ছিক কোড।"
      >
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          নাম (ইংরেজি)
          <input
            required
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            className={inputClassName()}
          />
        </label>

        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          নাম (বাংলা)
          <input
            value={nameBn}
            onChange={(ev) => setNameBn(ev.target.value)}
            placeholder="ঐচ্ছিক — যেমন ঢাকা বিভাগ"
            className={inputClassName()}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            স্লাগ
            <input
              required
              value={slug}
              onChange={(ev) => setSlug(ev.target.value)}
              className={inputClassName()}
            />
            {mode === "create" ? (
              <AdminActionButton
                type="button"
                variant="ghost"
                className="mt-1 h-auto min-h-0 justify-start px-0 py-0 text-xs text-emerald-800 hover:bg-transparent dark:text-emerald-400"
                onClick={() => setSlug(slugifyHint(name))}
              >
                ইংরেজি নাম থেকে সাজেস্ট
              </AdminActionButton>
            ) : (
              <p className="mt-1 text-xs text-zinc-500">
                স্লাগ পরিবর্তনে URL ও ইন্টিগ্রেশন প্রভাবিত হতে পারে।
              </p>
            )}
          </label>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            কোড (ঐচ্ছিক)
            <input
              value={code}
              onChange={(ev) => setCode(ev.target.value)}
              placeholder="যেমন BBS / অভ্যন্তরীণ কোড"
              className={inputClassName()}
            />
          </label>
        </div>
      </AdminFormSection>

      <AdminFormSection
        title="ধরন ও কাঠামো"
        description="বিভাগ → জেলা → উপজেলা → ইউনিয়ন → গ্রাম / সার্ভিস এরিয়া। সক্রিয় প্যারেন্টই তালিকায় দেখায়।"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            ধরন
            <select
              value={type}
              onChange={(ev) => {
                setType(ev.target.value as AreaType);
                setParentId("");
              }}
              className={inputClassName()}
            >
              {AREA_TYPES.map((t) => (
                <option key={t} value={t}>
                  {areaTypeBn(t)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            সাজানোর ক্রম
            <input
              type="number"
              required
              value={sortOrder}
              onChange={(ev) => setSortOrder(ev.target.value)}
              className={inputClassName()}
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          প্যারেন্ট এলাকা
          <select
            value={parentId}
            onChange={(ev) => setParentId(ev.target.value)}
            className={inputClassName()}
          >
            <option value="">
              কোনো নেই — বিভাগের জন্য রুট; অন্য ধরনে বৈধ প্যারেন্ট বাছুন
            </option>
            {parentSelectOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {formatAreaOptionLabel(p)}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            শুধু সক্রিয় ও স্তর অনুযায়ী মানানসই প্যারেন্ট দেখায়।
            {mode === "edit" && areaId ? " এই এলাকাকে নিজের প্যারেন্ট হিসেবে বেছে নেওয়া যাবে না।" : ""}
          </p>
        </label>
      </AdminFormSection>

      <AdminFormSection
        title="সক্রিয়তা"
        description="সক্রিয় এলাকা শুধু ‘সক্রিয়’ ফিল্টারে মেলানোতে দেখায়।"
      >
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(ev) => setIsActive(ev.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600"
          />
          সক্রিয় (সক্রিয়-শুধু সিলেক্টরে দৃশ্যমান)
        </label>
      </AdminFormSection>

      <div className="flex flex-wrap gap-3">
        <AdminActionButton type="submit" variant="primary" disabled={saving}>
          {saving ? "সংরক্ষণ…" : mode === "create" ? "এলাকা তৈরি" : "পরিবর্তন সংরক্ষণ"}
        </AdminActionButton>
        <AdminActionButton href="/admin/areas" variant="secondary">
          বাতিল
        </AdminActionButton>
      </div>
    </form>
  );
}
