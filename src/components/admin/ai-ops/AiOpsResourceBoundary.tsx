"use client";

import type { ReactNode } from "react";

import { AdminErrorState } from "@/components/admin-ui/AdminErrorState";
import { AdminLoadingState } from "@/components/admin-ui/AdminLoadingState";

export type AiOpsResourceBoundaryProps = Readonly<{
  loading: boolean;
  error: string | null;
  reload?: () => void;
  loadingMessage?: string;
  /** When true, skip the loading shell (e.g. data already present during refresh). */
  hasData?: boolean;
  children: ReactNode;
}>;

export function AiOpsResourceBoundary({
  loading,
  error,
  reload,
  loadingMessage = "Loading…",
  hasData = false,
  children,
}: AiOpsResourceBoundaryProps) {
  if (loading && !hasData) {
    return <AdminLoadingState message={loadingMessage} />;
  }
  if (error) {
    return <AdminErrorState message={error} onRetry={reload} />;
  }
  return <>{children}</>;
}
