"use client";

import { RotateCcw, X } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { AdminActionButton } from "./AdminActionButton";
import { useAdminTheme } from "./useAdminTheme";

export type AdminThemeCustomizerProps = Readonly<{
  open: boolean;
  onClose: () => void;
}>;

function SectionTitle({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--pd-admin-muted)]">
      {children}
    </h2>
  );
}

type RadioRowProps = Readonly<{
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  labelBn: string;
  descriptionBn?: string;
  titleEn?: string;
}>;

function RadioRow({
  name,
  value,
  checked,
  onChange,
  labelBn,
  descriptionBn,
  titleEn,
}: RadioRowProps) {
  const id = useId();
  const inputId = `${id}-${value}`;
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex cursor-pointer gap-3 rounded-[var(--pd-admin-radius-sm)] border p-3 transition-colors",
        checked
          ? "border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-950/40 dark:ring-emerald-500/25"
          : "border-[var(--pd-admin-border)] bg-[var(--pd-admin-surface)] hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50",
      )}
      title={titleEn}
    >
      <input
        id={inputId}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 shrink-0 accent-emerald-700 dark:accent-emerald-500"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">{labelBn}</span>
        {descriptionBn ? (
          <span className="mt-0.5 block text-xs text-[var(--pd-admin-muted)]">{descriptionBn}</span>
        ) : null}
      </span>
    </label>
  );
}

type SwitchRowProps = Readonly<{
  pressed: boolean;
  onPressedChange: (next: boolean) => void;
  labelBn: string;
  descriptionBn?: string;
  titleEn?: string;
}>;

function SwitchRow({ pressed, onPressedChange, labelBn, descriptionBn, titleEn }: SwitchRowProps) {
  const switchId = useId();
  return (
    <div className="flex items-start justify-between gap-4 rounded-[var(--pd-admin-radius-sm)] border border-[var(--pd-admin-border)] bg-[var(--pd-admin-surface)] p-3">
      <div className="min-w-0">
        <span id={`${switchId}-label`} className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {labelBn}
        </span>
        {descriptionBn ? (
          <span className="mt-0.5 block text-xs text-[var(--pd-admin-muted)]">{descriptionBn}</span>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={pressed}
        aria-labelledby={`${switchId}-label`}
        title={titleEn}
        onClick={() => onPressedChange(!pressed)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600",
          pressed ? "bg-emerald-600 dark:bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600",
        )}
      >
        <span className="sr-only">{labelBn}</span>
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
            pressed ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

export function AdminThemeCustomizer({ open, onClose }: AdminThemeCustomizerProps) {
  const baseId = useId();
  const groupAppearance = `${baseId}-appearance`;
  const groupSidebar = `${baseId}-sidebar`;
  const groupSidebarTheme = `${baseId}-sidebar-theme`;
  const groupContent = `${baseId}-content`;

  const {
    appearance,
    sidebarMode,
    sidebarTheme,
    contentWidth,
    topbarSticky,
    footerVisible,
    setAppearance,
    setSidebarMode,
    setSidebarTheme,
    setContentWidth,
    setTopbarSticky,
    setFooterVisible,
    resetAdminTheme,
  } = useAdminTheme();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 md:bg-zinc-900/30"
        aria-label="প্যানেল বন্ধ করুন"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
        className="relative z-[61] flex h-full w-full max-w-md flex-col border-l border-[var(--pd-admin-border)] bg-[var(--pd-admin-surface)] shadow-2xl dark:border-zinc-800"
        lang="bn"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--pd-admin-border)] px-4 py-4 dark:border-zinc-800">
          <div className="min-w-0">
            <h1 id={`${baseId}-title`} className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              থিম সেটিংস
            </h1>
            <p className="mt-1 text-xs text-[var(--pd-admin-muted)]">
              প্রাণী ডাক্তার অ্যাডমিন — শুধু এই ডিভাইসে সংরক্ষিত
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-[var(--pd-admin-radius-sm)] p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="বন্ধ করুন"
            title="Close panel"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5">
          <fieldset className="space-y-2">
            <legend className="sr-only">বাহ্যিক রূপ</legend>
            <SectionTitle>বাহ্যিক রূপ</SectionTitle>
            <div className="space-y-2">
              <RadioRow
                name={groupAppearance}
                value="system"
                checked={appearance === "system"}
                onChange={() => setAppearance("system")}
                labelBn="সিস্টেম"
                descriptionBn="অপারেটিং সিস্টেমের থিম অনুসরণ করুন"
                titleEn="Follow OS appearance"
              />
              <RadioRow
                name={groupAppearance}
                value="light"
                checked={appearance === "light"}
                onChange={() => setAppearance("light")}
                labelBn="আলো"
                descriptionBn="সবসময় হালকা থিম"
                titleEn="Always light"
              />
              <RadioRow
                name={groupAppearance}
                value="dark"
                checked={appearance === "dark"}
                onChange={() => setAppearance("dark")}
                labelBn="অন্ধকার"
                descriptionBn="সবসময় গাঢ় থিম"
                titleEn="Always dark"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="sr-only">সাইডবার</legend>
            <SectionTitle>সাইডবার</SectionTitle>
            <div className="space-y-2">
              <RadioRow
                name={groupSidebar}
                value="expanded"
                checked={sidebarMode === "expanded"}
                onChange={() => setSidebarMode("expanded")}
                labelBn="প্রসারিত"
                descriptionBn="ডেস্কটপে পূর্ণ প্রস্থ মেনু"
                titleEn="Expanded sidebar"
              />
              <RadioRow
                name={groupSidebar}
                value="collapsed"
                checked={sidebarMode === "collapsed"}
                onChange={() => setSidebarMode("collapsed")}
                labelBn="সংকুচিত"
                descriptionBn="ডেস্কটপে সরু সাইডবার"
                titleEn="Collapsed sidebar"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="sr-only">সাইডবার থিম</legend>
            <SectionTitle>সাইডবার থিম</SectionTitle>
            <div className="space-y-2">
              <RadioRow
                name={groupSidebarTheme}
                value="light"
                checked={sidebarTheme === "light"}
                onChange={() => setSidebarTheme("light")}
                labelBn="হালকা সাইডবার"
                descriptionBn="উজ্জ্বল পটভূমি"
                titleEn="Light sidebar"
              />
              <RadioRow
                name={groupSidebarTheme}
                value="dark"
                checked={sidebarTheme === "dark"}
                onChange={() => setSidebarTheme("dark")}
                labelBn="গাঢ় সাইডবার"
                descriptionBn="গাঢ় পটভূমি"
                titleEn="Dark sidebar"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="sr-only">কন্টেন্ট প্রস্থ</legend>
            <SectionTitle>কন্টেন্ট প্রস্থ</SectionTitle>
            <div className="space-y-2">
              <RadioRow
                name={groupContent}
                value="contained"
                checked={contentWidth === "contained"}
                onChange={() => setContentWidth("contained")}
                labelBn="সীমাবদ্ধ"
                descriptionBn="সর্বোচ্চ প্রস্থ সহ মাঝখানে সারিবদ্ধ"
                titleEn="Contained width"
              />
              <RadioRow
                name={groupContent}
                value="full"
                checked={contentWidth === "full"}
                onChange={() => setContentWidth("full")}
                labelBn="সম্পূর্ণ প্রস্থ"
                descriptionBn="কন্টেন্ট এলাকা পূর্ণ প্রস্থ জুড়ে"
                titleEn="Full width"
              />
            </div>
          </fieldset>

          <div className="space-y-2">
            <SectionTitle>টপবার</SectionTitle>
            <SwitchRow
              pressed={topbarSticky}
              onPressedChange={setTopbarSticky}
              labelBn="স্থির টপবার"
              descriptionBn="ডেস্কটপে স্ক্রল করলে টপবার উপরে থাকবে"
              titleEn="Sticky desktop topbar"
            />
          </div>

          <div className="space-y-2">
            <SectionTitle>ফুটার</SectionTitle>
            <SwitchRow
              pressed={footerVisible}
              onPressedChange={setFooterVisible}
              labelBn="ফুটার দেখান"
              descriptionBn="নিচে সংক্ষিপ্ত ফুটার সারি"
              titleEn="Show footer strip"
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-[var(--pd-admin-border)] bg-[var(--pd-admin-surface)] px-4 py-4 dark:border-zinc-800">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <AdminActionButton variant="ghost" className="w-full sm:w-auto" onClick={onClose}>
              বন্ধ করুন
            </AdminActionButton>
            <AdminActionButton
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                resetAdminTheme();
                onClose();
              }}
            >
              <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
              ডিফল্টে ফিরুন
            </AdminActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
