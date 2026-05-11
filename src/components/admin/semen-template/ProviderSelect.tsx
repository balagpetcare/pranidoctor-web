"use client";

import { useId, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import { FormAsyncControlSkeleton } from "@/components/admin-ui/FormAsyncControlSkeleton";
import { khInputClass, khLabelClass } from "@/components/admin/knowledge-hub/styles";
import type { AdminSemenProviderRow } from "@/components/admin/semen/SemenProvidersList";
import { cn } from "@/lib/cn";

export type ProviderSelectProps = Readonly<{
  id?: string;
  label: ReactNode;
  value: string;
  onChange: (id: string) => void;
  providers: AdminSemenProviderRow[];
  loading: boolean;
  loadError: string | null;
  disabled?: boolean;
  required?: boolean;
  /** Refetch after a failed load */
  onRetry?: () => void | Promise<void>;
}>;

export function ProviderSelect(props: ProviderSelectProps) {
  const { loadError, providers, onRetry } = props;
  const errRegionId = useId();

  const savingDisabled = props.disabled === true;
  const isLoading = props.loading === true;
  const retryDisabled = isLoading || savingDisabled;
  const isRequired = props.required === true;
  const hasError = Boolean(loadError);
  const invalidAttr = hasError ? "true" : "false";
  const busyAttr = isLoading ? "true" : "false";
  const selectDisabled = savingDisabled;

  return (
    <div className="space-y-1.5">
      <label className={cn(khLabelClass())} htmlFor={props.id}>
        {props.label}
      </label>
      <div className="relative">
        {isLoading ? (
          <FormAsyncControlSkeleton
            id={props.id}
            label="প্রদানকারীর তালিকা লোড হচ্ছে"
            className={cn(khInputClass(), "pd-semen-form-select", hasError && "border-amber-400")}
          />
        ) : (
          <select
            id={props.id}
            required={isRequired}
            value={props.value}
            onChange={(ev) => props.onChange(ev.target.value)}
            className={cn(khInputClass(), "pd-semen-form-select", hasError && "border-amber-400")}
            disabled={selectDisabled}
            aria-busy={busyAttr}
            aria-invalid={invalidAttr}
            aria-describedby={hasError ? errRegionId : undefined}
          >
            <option value="">নির্বাচন করুন</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nameBn?.trim() ? `${p.name} — ${p.nameBn}` : p.name}
              </option>
            ))}
          </select>
        )}
      </div>
      {hasError ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" id={errRegionId}>
          <p className="flex items-start gap-1.5 text-[13px] leading-relaxed text-amber-800 dark:text-amber-200" role="alert">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {loadError}
          </p>
          {onRetry ? (
            <button
              type="button"
              className="shrink-0 rounded-md border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-50 dark:border-amber-800 dark:bg-zinc-900 dark:text-amber-100 dark:hover:bg-zinc-800"
              onClick={() => void onRetry()}
              disabled={retryDisabled}
            >
              পুনঃচেষ্টা
            </button>
          ) : null}
        </div>
      ) : null}
      {!isLoading && !hasError && providers.length === 0 ? (
        <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          কোনো সক্রিয় প্রদানকারী নেই। প্রথমে{" "}
          <a className="font-medium text-emerald-700 underline dark:text-emerald-400" href="/admin/semen-providers/new">
            প্রদানকারী যোগ
          </a>{" "}
          করুন।
        </p>
      ) : null}
    </div>
  );
}
