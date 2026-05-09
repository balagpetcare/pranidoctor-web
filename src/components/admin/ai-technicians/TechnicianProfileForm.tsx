"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";
import { adminFetch } from "@/lib/admin/admin-fetch";
import { readAdminJson } from "@/lib/admin/read-admin-json";
import { cn } from "@/lib/cn";
import type { AdminAreaRow } from "@/types/admin-areas";
import type { AdminServiceCategoryOption } from "@/types/admin-doctors";
import type { AdminTechnicianDetail } from "@/types/admin-ai-technicians";

import { userStatusBn } from "./technician-labels";

function inputClassName(): string {
  return cn(
    "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
    "outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2",
    "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  );
}

export type TechnicianProfileFormProps = {
  mode: "create" | "edit";
  technicianId?: string;
};

const USER_STATUS_OPTIONS = [
  "ACTIVE",
  "SUSPENDED",
  "PENDING_VERIFICATION",
  "INVITED",
] as const;

export function TechnicianProfileForm({
  mode,
  technicianId,
}: TechnicianProfileFormProps) {
  const router = useRouter();
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [loadingTech, setLoadingTech] = useState(mode === "edit");
  const [loadRefsError, setLoadRefsError] = useState<string | null>(null);
  const [refsRetryKey, setRefsRetryKey] = useState(0);
  const [loadTechnicianError, setLoadTechnicianError] = useState<string | null>(
    null,
  );
  const [loadRetryKey, setLoadRetryKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [areas, setAreas] = useState<AdminAreaRow[]>([]);
  const [categories, setCategories] = useState<AdminServiceCategoryOption[]>(
    [],
  );

  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [certification, setCertification] = useState("");
  const [bio, setBio] = useState("");
  const [serviceFeeBdt, setServiceFeeBdt] = useState("");
  const [acceptsEmergency, setAcceptsEmergency] = useState(false);
  const [userStatus, setUserStatus] = useState<string>("ACTIVE");

  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function loadRefs() {
      setLoadingRefs(true);
      setLoadRefsError(null);
      try {
        const [areasRes, catRes] = await Promise.all([
          adminFetch("/api/admin/areas?limit=500"),
          adminFetch("/api/admin/service-categories"),
        ]);
        const areasData = await readAdminJson<{ areas: AdminAreaRow[] }>(
          areasRes,
        );
        const catData = await readAdminJson<{
          categories: AdminServiceCategoryOption[];
        }>(catRes);
        if (!cancelled) {
          setAreas(areasData.areas);
          setCategories(catData.categories);
        }
      } catch {
        if (!cancelled) {
          setLoadRefsError("এলাকা বা সেবা বিভাগ লোড করা যায়নি।");
        }
      } finally {
        if (!cancelled) setLoadingRefs(false);
      }
    }
    void loadRefs();
    return () => {
      cancelled = true;
    };
  }, [refsRetryKey]);

  useEffect(() => {
    if (mode !== "edit" || !technicianId) return;
    let cancelled = false;
    async function loadTechnician() {
      setLoadingTech(true);
      setLoadTechnicianError(null);
      try {
        const data = await readAdminJson<{ technician: AdminTechnicianDetail }>(
          await adminFetch(`/api/admin/ai-technicians/${technicianId}`),
        );
        if (cancelled) return;
        const t = data.technician;
        setDisplayName(t.displayName ?? "");
        setEmail(t.user.email);
        setPhone(t.user.phone ?? "");
        setCertification(t.certification ?? "");
        setBio(t.bio ?? "");
        setServiceFeeBdt(t.serviceFeeBdt ?? "");
        setAcceptsEmergency(t.acceptsEmergency);
        setUserStatus(t.user.status);
        setSelectedAreaIds(t.workingAreas.map((w) => w.area.id));
        setSelectedCategoryIds(
          t.serviceCategories.map((c) => c.serviceCategory.id),
        );
      } catch (e) {
        if (!cancelled) {
          setLoadTechnicianError(
            e instanceof Error ? e.message : "Could not load technician",
          );
        }
      } finally {
        if (!cancelled) setLoadingTech(false);
      }
    }
    void loadTechnician();
    return () => {
      cancelled = true;
    };
  }, [mode, technicianId, loadRetryKey]);

  function toggleArea(id: string) {
    setSelectedAreaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const feeNum = serviceFeeBdt.trim()
      ? Number.parseFloat(serviceFeeBdt)
      : undefined;
    if (
      serviceFeeBdt.trim() !== "" &&
      (feeNum === undefined || Number.isNaN(feeNum) || feeNum < 0)
    ) {
      setFormError("Service fee must be a valid non-negative number.");
      setSaving(false);
      return;
    }

    try {
      if (mode === "create") {
        if (password.length < 8) {
          setFormError("Password must be at least 8 characters.");
          setSaving(false);
          return;
        }

        const created = await readAdminJson<{ technician: AdminTechnicianDetail }>(
          await adminFetch("/api/admin/ai-technicians", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email.trim(),
              phone: phone.trim(),
              password,
              displayName: displayName.trim(),
              certification: certification.trim(),
              bio: bio.trim() || undefined,
              serviceFeeBdt: feeNum,
              acceptsEmergency,
              initialAreaIds:
                selectedAreaIds.length > 0 ? selectedAreaIds : undefined,
              initialServiceCategoryIds:
                selectedCategoryIds.length > 0
                  ? selectedCategoryIds
                  : undefined,
            }),
          }),
        );

        const id = created.technician.id;

        router.push(`/admin/ai-technicians/${id}`);
        router.refresh();
        return;
      }

      if (!technicianId) {
        setFormError("Missing technician id.");
        setSaving(false);
        return;
      }

      const patchBody: Record<string, unknown> = {
        email: email.trim(),
        phone: phone.trim(),
        displayName: displayName.trim() || null,
        certification: certification.trim() || null,
        bio: bio.trim() || null,
        serviceFeeBdt:
          serviceFeeBdt.trim() === "" ? null : (feeNum ?? null),
        acceptsEmergency,
      };

      if (USER_STATUS_OPTIONS.some((o) => o === userStatus)) {
        patchBody.userStatus = userStatus;
      }

      await readAdminJson(
        await adminFetch(`/api/admin/ai-technicians/${technicianId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchBody),
        }),
      );

      await readAdminJson(
        await adminFetch(
          `/api/admin/ai-technicians/${technicianId}/working-areas`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ areaIds: selectedAreaIds }),
          },
        ),
      );

      await readAdminJson(
        await adminFetch(
          `/api/admin/ai-technicians/${technicianId}/service-categories`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              serviceCategoryIds: selectedCategoryIds,
            }),
          },
        ),
      );

      router.push(`/admin/ai-technicians/${technicianId}`);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loadingRefs || (mode === "edit" && loadingTech)) {
    return <AdminLoadingState message="ফর্ম লোড হচ্ছে…" />;
  }

  if (loadRefsError) {
    return (
      <div className="space-y-4" lang="bn">
        <AdminErrorState
          message={loadRefsError}
          onRetry={() => setRefsRetryKey((k) => k + 1)}
        />
        <AdminActionButton href="/admin/ai-technicians" variant="secondary">
          ← এআই টেকনিশিয়ান তালিকা
        </AdminActionButton>
      </div>
    );
  }

  if (mode === "edit" && loadTechnicianError) {
    return (
      <div className="space-y-4" lang="bn">
        <AdminErrorState
          message={loadTechnicianError}
          onRetry={() => setLoadRetryKey((k) => k + 1)}
        />
        <AdminActionButton href="/admin/ai-technicians" variant="secondary">
          ← এআই টেকনিশিয়ান তালিকা
        </AdminActionButton>
      </div>
    );
  }

  const sortedAreas = [...areas].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <form
      onSubmit={(ev) => void handleSubmit(ev)}
      className="space-y-6"
      lang="bn"
    >
      {formError ? (
        <AdminErrorState title="সংরক্ষণ বা ডেটা ত্রুটি" message={formError} />
      ) : null}

      <AdminFormSection
        title="পরিচয় ও যোগাযোগ"
        description={
          mode === "create"
            ? "নতুন এআই টেকনিশিয়ান অ্যাকাউন্ট; পাসওয়ার্ড বাধ্যতামূলক।"
            : "ইমেইল ও ফোন আপডেট করুন।"
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {mode === "create" ? (
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              পাসওয়ার্ড *
              <input
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                className={inputClassName()}
              />
            </label>
          ) : null}
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            প্রদর্শন নাম *
            <input
              required
              value={displayName}
              onChange={(ev) => setDisplayName(ev.target.value)}
              className={inputClassName()}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            ইমেইল *
            <input
              type="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className={inputClassName()}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            ফোন *
            <input
              required
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
              className={inputClassName()}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            সার্টিফিকেট / নিবন্ধন *
            <input
              required
              value={certification}
              onChange={(ev) => setCertification(ev.target.value)}
              className={inputClassName()}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            সেবা ফি (BDT)
            <input
              inputMode="decimal"
              value={serviceFeeBdt}
              onChange={(ev) => setServiceFeeBdt(ev.target.value)}
              placeholder="যেমন ১২০০"
              className={inputClassName()}
            />
          </label>
          {mode === "edit" ? (
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              অ্যাকাউন্ট স্ট্যাটাস
              <select
                value={userStatus}
                onChange={(ev) => setUserStatus(ev.target.value)}
                className={inputClassName()}
              >
                {USER_STATUS_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {userStatusBn(o)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </AdminFormSection>

      <AdminFormSection title="পরিচিতি ও মাঠ সেবা" description="জরুরি মাঠে উপলব্ধতা।">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          পরিচিতি
          <textarea
            rows={4}
            value={bio}
            onChange={(ev) => setBio(ev.target.value)}
            className={cn(inputClassName(), "font-normal")}
          />
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={acceptsEmergency}
            onChange={(ev) => setAcceptsEmergency(ev.target.checked)}
            className="h-4 w-4 rounded border-zinc-400 text-emerald-700"
          />
          জরুরি মাঠ সেবা গ্রহণ
        </label>
      </AdminFormSection>

      <AdminFormSection
        title="সার্ভিস এলাকা"
        description="এক বা একাধিক এলাকা (ফ্ল্যাট তালিকা, সর্বোচ্চ ৫০০টি লোড)।"
      >
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
          {sortedAreas.map((a) => (
            <label
              key={a.id}
              className="flex cursor-pointer items-start gap-2 text-sm text-zinc-800 dark:text-zinc-200"
            >
              <input
                type="checkbox"
                checked={selectedAreaIds.includes(a.id)}
                onChange={() => toggleArea(a.id)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-400 text-emerald-700"
              />
              <span>
                {a.name}
                {a.nameBn ? ` (${a.nameBn})` : ""}{" "}
                <span className="text-zinc-400">· {a.type}</span>
              </span>
            </label>
          ))}
        </div>
      </AdminFormSection>

      <AdminFormSection
        title="সেবা বিভাগ"
        description="কৃত্রিম প্রজনন ও সংশ্লিষ্ট সেবা — ক্যাটালগ থেকে বেছে নিন।"
      >
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
          {categories.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-start gap-2 text-sm text-zinc-800 dark:text-zinc-200"
            >
              <input
                type="checkbox"
                checked={selectedCategoryIds.includes(c.id)}
                onChange={() => toggleCategory(c.id)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-400 text-emerald-700"
              />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </AdminFormSection>

      <div className="flex flex-wrap gap-3">
        <AdminActionButton type="submit" variant="primary" disabled={saving}>
          {saving
            ? "সংরক্ষণ…"
            : mode === "create"
              ? "এআই টেকনিশিয়ান তৈরি"
              : "পরিবর্তন সংরক্ষণ"}
        </AdminActionButton>
        <AdminActionButton
          href={
            mode === "edit" && technicianId
              ? `/admin/ai-technicians/${technicianId}`
              : "/admin/ai-technicians"
          }
          variant="secondary"
        >
          বাতিল
        </AdminActionButton>
      </div>
    </form>
  );
}
