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
import type {
  AdminDoctorDetail,
  AdminServiceCategoryOption,
} from "@/types/admin-doctors";

function inputClassName(): string {
  return cn(
    "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
    "outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2",
    "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  );
}

export type DoctorProfileFormProps = {
  mode: "create" | "edit";
  doctorId?: string;
};

export function DoctorProfileForm({ mode, doctorId }: DoctorProfileFormProps) {
  const router = useRouter();
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [loadingDoctor, setLoadingDoctor] = useState(mode === "edit");
  const [loadDoctorError, setLoadDoctorError] = useState<string | null>(null);
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
  const [degree, setDegree] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [visitFeeBdt, setVisitFeeBdt] = useState("");
  const [acceptsEmergency, setAcceptsEmergency] = useState(false);
  const [acceptsOnlineConsultation, setAcceptsOnlineConsultation] =
    useState(false);

  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function loadRefs() {
      setLoadingRefs(true);
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
          setFormError("Could not load areas or categories.");
        }
      } finally {
        if (!cancelled) setLoadingRefs(false);
      }
    }
    void loadRefs();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !doctorId) return;
    let cancelled = false;
    async function loadDoctor() {
      setLoadingDoctor(true);
      setLoadDoctorError(null);
      try {
        const data = await readAdminJson<{ doctor: AdminDoctorDetail }>(
          await adminFetch(`/api/admin/doctors/${doctorId}`),
        );
        if (cancelled) return;
        const d = data.doctor;
        setDisplayName(d.displayName ?? "");
        setEmail(d.user.email);
        setPhone(d.user.phone ?? "");
        setDegree(d.degree ?? "");
        setLicenseNumber(d.licenseNumber);
        setSpecialization(d.specialization ?? "");
        setExperienceYears(
          d.experienceYears != null ? String(d.experienceYears) : "",
        );
        setBio(d.bio ?? "");
        setProfilePhotoUrl(d.profilePhotoUrl ?? "");
        setVisitFeeBdt(d.visitFeeBdt ?? "");
        setAcceptsEmergency(d.acceptsEmergency);
        setAcceptsOnlineConsultation(d.acceptsOnlineConsultation);
        setSelectedAreaIds(d.workingAreas.map((w) => w.area.id));
        setSelectedCategoryIds(
          d.serviceCategories.map((c) => c.serviceCategory.id),
        );
      } catch (e) {
        if (!cancelled) {
          setLoadDoctorError(
            e instanceof Error ? e.message : "Could not load doctor",
          );
        }
      } finally {
        if (!cancelled) setLoadingDoctor(false);
      }
    }
    void loadDoctor();
    return () => {
      cancelled = true;
    };
  }, [mode, doctorId, loadRetryKey]);

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

    const expNum = experienceYears.trim()
      ? Number.parseInt(experienceYears, 10)
      : undefined;
    if (
      experienceYears.trim() !== "" &&
      (expNum === undefined || Number.isNaN(expNum) || expNum < 0)
    ) {
      setFormError("Experience years must be a valid non-negative integer.");
      setSaving(false);
      return;
    }

    const feeNum = visitFeeBdt.trim()
      ? Number.parseFloat(visitFeeBdt)
      : undefined;
    if (
      visitFeeBdt.trim() !== "" &&
      (feeNum === undefined || Number.isNaN(feeNum) || feeNum < 0)
    ) {
      setFormError("Visit fee must be a valid non-negative number.");
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

        const created = await readAdminJson<{ doctor: AdminDoctorDetail }>(
          await adminFetch("/api/admin/doctors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email.trim(),
              phone: phone.trim(),
              password,
              displayName: displayName.trim(),
              licenseNumber: licenseNumber.trim(),
              degree: degree.trim() || undefined,
              specialization: specialization.trim() || undefined,
              experienceYears: expNum,
              bio: bio.trim() || undefined,
              profilePhotoUrl: profilePhotoUrl.trim() || undefined,
              visitFeeBdt: feeNum,
              acceptsEmergency,
              acceptsOnlineConsultation,
            }),
          }),
        );

        const id = created.doctor.id;

        await readAdminJson(
          await adminFetch(`/api/admin/doctors/${id}/working-areas`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ areaIds: selectedAreaIds }),
          }),
        );

        await readAdminJson(
          await adminFetch(`/api/admin/doctors/${id}/service-categories`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              serviceCategoryIds: selectedCategoryIds,
            }),
          }),
        );

        router.push(`/admin/doctors/${id}`);
        router.refresh();
        return;
      }

      if (!doctorId) {
        setFormError("Missing doctor id.");
        setSaving(false);
        return;
      }

      await readAdminJson(
        await adminFetch(`/api/admin/doctors/${doctorId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            phone: phone.trim(),
            displayName: displayName.trim() || null,
            licenseNumber: licenseNumber.trim(),
            degree: degree.trim() || null,
            specialization: specialization.trim() || null,
            experienceYears:
              experienceYears.trim() === ""
                ? null
                : expNum ?? null,
            bio: bio.trim() || null,
            profilePhotoUrl: profilePhotoUrl.trim() || null,
            visitFeeBdt:
              visitFeeBdt.trim() === "" ? null : (feeNum ?? null),
            acceptsEmergency,
            acceptsOnlineConsultation,
          }),
        }),
      );

      await readAdminJson(
        await adminFetch(`/api/admin/doctors/${doctorId}/working-areas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ areaIds: selectedAreaIds }),
        }),
      );

      await readAdminJson(
        await adminFetch(`/api/admin/doctors/${doctorId}/service-categories`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceCategoryIds: selectedCategoryIds,
          }),
        }),
      );

      router.push(`/admin/doctors/${doctorId}`);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loadingRefs || (mode === "edit" && loadingDoctor)) {
    return <AdminLoadingState message="ফর্ম লোড হচ্ছে…" />;
  }

  if (mode === "edit" && loadDoctorError) {
    return (
      <div className="space-y-4">
        <AdminErrorState
          message={loadDoctorError}
          onRetry={() => setLoadRetryKey((k) => k + 1)}
        />
        <AdminActionButton href="/admin/doctors" variant="secondary">
          ← ডাক্তার তালিকা
        </AdminActionButton>
      </div>
    );
  }

  const sortedAreas = [...areas].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <form onSubmit={(ev) => void handleSubmit(ev)} className="space-y-6" lang="bn">
      {formError ? (
        <AdminErrorState title="সংরক্ষণ বা ডেটা ত্রুটি" message={formError} />
      ) : null}

      <AdminFormSection
        title="পরিচয় ও যোগাযোগ"
        description={
          mode === "create"
            ? "নতুন অ্যাকাউন্টের জন্য পাসওয়ার্ড বাধ্যতামূলক।"
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
            নাম *
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
        </div>
      </AdminFormSection>

      <AdminFormSection title="পেশাগত তথ্য" description="লাইসেন্স, ডিগ্রি, ভিজিট ফি।">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            ডিগ্রি
            <input
              value={degree}
              onChange={(ev) => setDegree(ev.target.value)}
              className={inputClassName()}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            লাইসেন্স / নিবন্ধন নম্বর *
            <input
              required
              value={licenseNumber}
              onChange={(ev) => setLicenseNumber(ev.target.value)}
              className={inputClassName()}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            বিশেষতা
            <input
              value={specialization}
              onChange={(ev) => setSpecialization(ev.target.value)}
              className={inputClassName()}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            অভিজ্ঞতা (বছর)
            <input
              inputMode="numeric"
              value={experienceYears}
              onChange={(ev) => setExperienceYears(ev.target.value)}
              placeholder="যেমন ৫"
              className={inputClassName()}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            ভিজিট ফি (BDT)
            <input
              inputMode="decimal"
              value={visitFeeBdt}
              onChange={(ev) => setVisitFeeBdt(ev.target.value)}
              placeholder="যেমন ৫০০"
              className={inputClassName()}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:col-span-2">
            প্রোফাইল ছবির URL
            <input
              value={profilePhotoUrl}
              onChange={(ev) => setProfilePhotoUrl(ev.target.value)}
              placeholder="https://…"
              className={inputClassName()}
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          পরিচিতি
          <textarea
            rows={4}
            value={bio}
            onChange={(ev) => setBio(ev.target.value)}
            className={cn(inputClassName(), "font-normal")}
          />
        </label>
      </AdminFormSection>

      <AdminFormSection title="জরুরি ও অনলাইন" description="সেবার ধরন অনুযায় চেকবক্স।">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={acceptsEmergency}
              onChange={(ev) => setAcceptsEmergency(ev.target.checked)}
              className="h-4 w-4 rounded border-zinc-400 text-emerald-700"
            />
            জরুরি সেবা গ্রহণ
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            <input
              type="checkbox"
              checked={acceptsOnlineConsultation}
              onChange={(ev) => setAcceptsOnlineConsultation(ev.target.checked)}
              className="h-4 w-4 rounded border-zinc-400 text-emerald-700"
            />
            অনলাইন পরামর্শ
          </label>
        </div>
      </AdminFormSection>

      <AdminFormSection
        title="সার্ভিস এলাকা"
        description="এক বা একাধিক এলাকা (এলাকা ব্যবস্থাপনার ট্রি)।"
      >
        <div className="max-h-52 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
          {sortedAreas.length === 0 ? (
            <p className="text-sm text-zinc-500">কোনো এলাকা লোড হয়নি।</p>
          ) : (
            <ul className="space-y-1">
              {sortedAreas.map((a) => (
                <li key={a.id}>
                  <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={selectedAreaIds.includes(a.id)}
                      onChange={() => toggleArea(a.id)}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-400 text-emerald-700"
                    />
                    <span>
                      {a.name}
                      {a.nameBn ? (
                        <span className="text-zinc-500"> ({a.nameBn})</span>
                      ) : null}{" "}
                      <span className="text-xs text-zinc-400">· {a.type}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AdminFormSection>

      <AdminFormSection title="সেবা বিভাগ" description="ক্যাটালগ থেকে বিভাগ বাছাই।">
        <div className="max-h-52 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
          {categories.length === 0 ? (
            <p className="text-sm text-zinc-500">ক্যাটালগে কোনো বিভাগ নেই।</p>
          ) : (
            <ul className="space-y-1">
              {categories.map((c) => (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(c.id)}
                      onChange={() => toggleCategory(c.id)}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-400 text-emerald-700"
                    />
                    <span>{c.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AdminFormSection>

      <div className="flex flex-wrap gap-3">
        <AdminActionButton type="submit" variant="primary" disabled={saving}>
          {saving ? "সংরক্ষণ…" : mode === "create" ? "ডাক্তার তৈরি" : "পরিবর্তন সংরক্ষণ"}
        </AdminActionButton>
        <AdminActionButton
          href={
            mode === "edit" && doctorId
              ? `/admin/doctors/${doctorId}`
              : "/admin/doctors"
          }
          variant="secondary"
        >
          বাতিল
        </AdminActionButton>
      </div>
    </form>
  );
}
