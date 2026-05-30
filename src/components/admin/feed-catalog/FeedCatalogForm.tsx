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

import { FEED_CATEGORY_OPTIONS, FEED_UNIT_OPTIONS } from "./feed-catalog-options";

type Props = {
  mode: "create" | "edit";
  itemId?: string;
};

export function FeedCatalogForm({ mode, itemId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [category, setCategory] = useState("CONCENTRATE");
  const [defaultUnit, setDefaultUnit] = useState("KG");
  const [approxPriceBdt, setApproxPriceBdt] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [isSeeded, setIsSeeded] = useState(false);

  const load = useCallback(async () => {
    if (mode !== "edit" || !itemId) return;
    setLoading(true);
    try {
      const data = await readAdminJson<{
        item: {
          code: string;
          nameBn: string;
          nameEn: string;
          category: string;
          defaultUnit: string;
          approxPriceBdt: number | null;
          sortOrder: number;
          isActive: boolean;
          isSeeded: boolean;
        };
      }>(await adminFetch(`/api/admin/feed-catalog/${itemId}`));
      const row = data.item;
      setCode(row.code);
      setNameBn(row.nameBn);
      setNameEn(row.nameEn);
      setCategory(row.category);
      setDefaultUnit(row.defaultUnit);
      setApproxPriceBdt(row.approxPriceBdt != null ? String(row.approxPriceBdt) : "");
      setSortOrder(String(row.sortOrder));
      setIsActive(row.isActive);
      setIsSeeded(row.isSeeded);
    } catch (e) {
      setError(e instanceof Error ? e.message : "লোড ব্যর্থ");
    } finally {
      setLoading(false);
    }
  }, [mode, itemId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const price =
        approxPriceBdt.trim() === "" ? null : Number.parseFloat(approxPriceBdt);
      if (mode === "create") {
        await readAdminJson(
          await adminFetch("/api/admin/feed-catalog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: code.trim().toLowerCase(),
              nameBn: nameBn.trim(),
              nameEn: nameEn.trim(),
              category,
              defaultUnit,
              approxPriceBdt: price,
              sortOrder: Number.parseInt(sortOrder, 10) || 0,
              isActive,
            }),
          }),
        );
      } else if (itemId) {
        await readAdminJson(
          await adminFetch(`/api/admin/feed-catalog/${itemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nameBn: nameBn.trim(),
              nameEn: nameEn.trim(),
              category,
              defaultUnit,
              approxPriceBdt: price,
              sortOrder: Number.parseInt(sortOrder, 10) || 0,
              isActive,
            }),
          }),
        );
      }
      router.push("/admin/feed-catalog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoadingState message="লোড হচ্ছে…" />;

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mx-auto max-w-2xl space-y-6">
      {error ? <AdminErrorState message={error} /> : null}
      <AdminFormSection title="মাস্টার খাদ্য">
        {mode === "create" ? (
          <div>
            <label className={khLabelClass()}>কোড (ইংরেজি, হাইফেন)</label>
            <input
              className={khInputClass()}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              pattern="[a-z0-9-]+"
            />
          </div>
        ) : (
          <p className="text-sm text-neutral-600">
            কোড: <span className="font-mono">{code}</span>
            {isSeeded ? " · সিডেড" : null}
          </p>
        )}
        <div>
          <label className={khLabelClass()}>নাম (বাংলা)</label>
          <input
            className={khInputClass()}
            value={nameBn}
            onChange={(e) => setNameBn(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={khLabelClass()}>নাম (ইংরেজি)</label>
          <input
            className={khInputClass()}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={khLabelClass()}>বিভাগ</label>
            <select
              className={khInputClass()}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {FEED_CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.labelBn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={khLabelClass()}>একক</label>
            <select
              className={khInputClass()}
              value={defaultUnit}
              onChange={(e) => setDefaultUnit(e.target.value)}
            >
              {FEED_UNIT_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={khLabelClass()}>আনুমানিক দাম (৳)</label>
            <input
              className={khInputClass()}
              type="number"
              min={0}
              step="0.01"
              value={approxPriceBdt}
              onChange={(e) => setApproxPriceBdt(e.target.value)}
            />
          </div>
          <div>
            <label className={khLabelClass()}>সাজানোর ক্রম</label>
            <input
              className={khInputClass()}
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          সক্রিয় (নিষ্ক্রিয় = আর্কাইভ, মুছে ফেলা নয়)
        </label>
      </AdminFormSection>
      <div className="flex gap-3">
        <AdminActionButton type="submit" variant="primary" disabled={saving}>
          {saving ? "সংরক্ষণ…" : "সংরক্ষণ"}
        </AdminActionButton>
        <AdminActionButton href="/admin/feed-catalog" variant="ghost">
          বাতিল
        </AdminActionButton>
      </div>
    </form>
  );
}
