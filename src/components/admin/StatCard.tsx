import type { LucideIcon } from "lucide-react";

import { AdminStatCard } from "@/components/admin-ui/AdminStatCard";

export type StatCardProps = {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
};

/** @deprecated Prefer `AdminStatCard` from `@/components/admin-ui`. */
export function StatCard(props: StatCardProps) {
  return <AdminStatCard {...props} />;
}
