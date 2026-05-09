"use client";

import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/cn";

import { AdminActionButton } from "./AdminActionButton";

export type AdminErrorStateProps = Readonly<{
  title?: React.ReactNode;
  message: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}>;

export function AdminErrorState({
  title = "সমস্যা হয়েছে",
  message,
  onRetry,
  className,
}: AdminErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[var(--pd-admin-radius,0.75rem)] border border-red-200 bg-red-50/80 px-6 py-10 text-center dark:border-red-900/50 dark:bg-red-950/30",
        className,
      )}
      role="alert"
    >
      <AlertCircle className="h-8 w-8 text-red-700 dark:text-red-400" aria-hidden />
      <p className="text-sm font-semibold text-red-900 dark:text-red-200">{title}</p>
      <p className="max-w-md text-sm text-red-800/90 dark:text-red-200/90">{message}</p>
      {onRetry ? (
        <AdminActionButton type="button" variant="secondary" className="mt-2" onClick={onRetry}>
          আবার চেষ্টা করুন
        </AdminActionButton>
      ) : null}
    </div>
  );
}
