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

import type { AdminSemenProviderRow } from "./SemenProvidersList";
import { SEMEN_PROVIDER_VERIFICATION_STATUS_OPTIONS } from "./semen-ui-options";

type AdminSemenProviderDetail = AdminSemenProviderRow & {
  description: string | null;
  descriptionBn: string | null;
  logoUploadedFileId: string | null;
};

type Props = { mode: "create" } | { mode: "edit"; providerId: string };

export function SemenProviderForm(props: Props) {
  const router = useRouter();
  const providerId = props.mode === "edit" ? props.providerId : "";
  const [loadKey, setLoadKey] = useState(0);
  const [loading, setLoading] = useState(props.mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionBn, setDescriptionBn] = useState("");
  const [logoUploadedFileId, setLogoUploadedFileId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState("UNVERIFIED");
  const [sortOrder, setSortOrder] = useState("0");

  const load = useCallback(async () => {
    if (props.mode !== "edit") return;
    setLoading(true);
    setError(null);
    try {
      const data = await readAdminJson<{ provider: AdminSemenProviderDetail }>(
        await adminFetch(`/api/admin/semen-providers/${providerId}`),
      );
      const p = data.provider;
      setSlug(p.slug);
      setName(p.name);
      setNameBn(p.nameBn ?? "");
      setDescription(p.description ?? "");
      setDescriptionBn(p.descriptionBn ?? "");
      setLogoUploadedFileId(p.logoUploadedFileId ?? "");
      setIsActive(p.isActive);
      setVerificationStatus(p.verificationStatus);
      setSortOrder(String(p.sortOrder));
    } catch (e) {
      setError(e instanceof Error ? e.message : "লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [props.mode, providerId]);

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
        name: name.trim(),
        nameBn: nameBn.trim() || null,
        description: description.trim() || null,
        descriptionBn: descriptionBn.trim() || null,
        logoUploadedFileId: logoUploadedFileId.trim() || null,
        isActive,
        verificationStatus,
        sortOrder: Number(sortOrder) || 0,
      };
      if (props.mode === "create") {
        await readAdminJson<{ provider: { id: string } }>(
          await adminFetch("/api/admin/semen-providers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        router.push("/admin/semen-providers");
        router.refresh();
      } else {
        await readAdminJson<{ provider: unknown }>(
          await adminFetch(`/api/admin/semen-providers/${providerId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        router.push("/admin/semen-providers");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <AdminLoadingState message="প্রদানকারী লোড হচ্ছে…" />;
  }

  if (props.mode === "edit" && error && !name) {
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

      <AdminFormSection title="পরিচয়" description="স্লাগ ছোট হাতের ইংরেজি, হাইফেন।">
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
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            className={khInputClass()}
            disabled={saving}
          />
        </label>
        <label className={cn(khLabelClass(), "mt-3 block")}>
          নাম (বাংলা)
          <input
            value={nameBn}
            onChange={(ev) => setNameBn(ev.target.value)}
            className={khInputClass()}
            disabled={saving}
          />
        </label>
      </AdminFormSection>

      <AdminFormSection title="বিবরণ ও লোগো" description="লোগোর জন্য আপলোড করা ফাইলের আইডি দিন।">
        <label className={khLabelClass()}>
          বিবরণ (English)
          <textarea
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            className={khInputClass()}
            rows={3}
            disabled={saving}
          />
        </label>
        <label className={cn(khLabelClass(), "mt-3 block")}>
          বিবরণ (বাংলা)
          <textarea
            value={descriptionBn}
            onChange={(ev) => setDescriptionBn(ev.target.value)}
            className={khInputClass()}
            rows={3}
            disabled={saving}
          />
        </label>
        <label className={cn(khLabelClass(), "mt-3 block")}>
          লোগো uploadedFileId
          <input
            value={logoUploadedFileId}
            onChange={(ev) => setLogoUploadedFileId(ev.target.value)}
            className={khInputClass()}
            placeholder="ঐচ্ছিক"
            disabled={saving}
          />
        </label>
      </AdminFormSection>

      <AdminFormSection title="স্ট্যাটাস">
        <label className={khLabelClass()}>
          যাচাই স্তর
          <select
            value={verificationStatus}
            onChange={(ev) => setVerificationStatus(ev.target.value)}
            className={khInputClass()}
            disabled={saving}
          >
            {SEMEN_PROVIDER_VERIFICATION_STATUS_OPTIONS.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <label className={cn(khLabelClass(), "mt-3 block")}>
          সাজানো ক্রম
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(ev) => setSortOrder(ev.target.value)}
            className={khInputClass()}
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
          href="/admin/semen-providers"
        >
          বাতিল
        </AdminActionButton>
      </div>
    </form>
  );
}
