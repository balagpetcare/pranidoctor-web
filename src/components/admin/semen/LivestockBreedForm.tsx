"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { khInputClass, khLabelClass } from "@/components/admin/knowledge-hub/styles";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { cn } from "@/lib/cn";

import type { AdminLivestockBreedRow } from "./LivestockBreedsList";
import { ANIMAL_TYPE_OPTIONS, type AnimalTypeValue } from "./semen-ui-options";

type Props = { mode: "create" } | { mode: "edit"; breedId: string };

export function LivestockBreedForm(props: Props) {
  const router = useRouter();
  const breedId = props.mode === "edit" ? props.breedId : "";
  const [loadKey, setLoadKey] = useState(0);
  const [loading, setLoading] = useState(props.mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [animalType, setAnimalType] = useState<AnimalTypeValue>("CATTLE");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const load = useCallback(async () => {
    if (props.mode !== "edit") return;
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{
        breed: AdminLivestockBreedRow & { description: string | null };
      }>(await adminFetch(`/api/admin/livestock-breeds/${breedId}`));
      const b = data.breed;
      setSlug(b.slug);
      setNameEn(b.nameEn);
      setNameBn(b.nameBn);
      setAnimalType(b.animalType as AnimalTypeValue);
      setDescription(b.description ?? "");
      setIsActive(b.isActive);
    } catch (e) {
      setError(e instanceof Error ? e.message : "লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [props.mode, breedId]);

  useEffect(() => {
     
    void load();
  }, [load, loadKey]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        slug: slug.trim().toLowerCase(),
        nameEn: nameEn.trim(),
        nameBn: nameBn.trim(),
        animalType,
        description: description.trim() || null,
        isActive,
      };
      if (props.mode === "create") {
        await readAdminJson<{ breed: { id: string } }>(
          await adminFetch("/api/admin/livestock-breeds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
      } else {
        await readAdminJson<{ breed: unknown }>(
          await adminFetch(`/api/admin/livestock-breeds/${breedId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
      }
      router.push("/admin/livestock-breeds");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <AdminLoadingState message="জাত লোড হচ্ছে…" />;
  }

  if (props.mode === "edit" && error && !nameEn) {
    return (
      <AdminErrorState message={error} onRetry={() => setLoadKey((k) => k + 1)} />
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

      <AdminFormSection title="জাত">
        <label className={khLabelClass()}>
          স্লাগ <span className="text-rose-600">*</span>
          <input
            required
            value={slug}
            onChange={(ev) => setSlug(ev.target.value)}
            className={khInputClass()}
            disabled={saving}
          />
        </label>
        <label className={cn(khLabelClass(), "mt-3 block")}>
          নাম (English) <span className="text-rose-600">*</span>
          <input
            required
            value={nameEn}
            onChange={(ev) => setNameEn(ev.target.value)}
            className={khInputClass()}
            disabled={saving}
          />
        </label>
        <label className={cn(khLabelClass(), "mt-3 block")}>
          নাম (বাংলা) <span className="text-rose-600">*</span>
          <input
            required
            value={nameBn}
            onChange={(ev) => setNameBn(ev.target.value)}
            className={khInputClass()}
            disabled={saving}
          />
        </label>
        <label className={cn(khLabelClass(), "mt-3 block")}>
          প্রাণীর ধরন <span className="text-rose-600">*</span>
          <select
            value={animalType}
            onChange={(ev) => setAnimalType(ev.target.value as AnimalTypeValue)}
            className={khInputClass()}
            disabled={saving}
          >
            {ANIMAL_TYPE_OPTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        <label className={cn(khLabelClass(), "mt-3 block")}>
          বিবরণ
          <textarea
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            className={khInputClass()}
            rows={3}
            disabled={saving}
          />
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(ev) => setIsActive(ev.target.checked)}
            disabled={saving}
          />
          সক্রিয়
        </label>
      </AdminFormSection>

      <div className="flex flex-wrap gap-3">
        <AdminActionButton type="submit" variant="primary" disabled={saving}>
          {saving ? "সংরক্ষণ…" : "সংরক্ষণ"}
        </AdminActionButton>
        <AdminActionButton
          type="button"
          variant="ghost"
          href="/admin/livestock-breeds"
        >
          বাতিল
        </AdminActionButton>
      </div>
    </form>
  );
}
