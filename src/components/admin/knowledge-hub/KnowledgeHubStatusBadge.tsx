"use client";

import { AdminBadge } from "@/components/admin-ui/AdminBadge";

import {
  approvalStatusBadgeVariant,
  approvalStatusBn,
  approvalStatusTitleEn,
} from "./knowledge-hub-labels";

export function KnowledgeHubStatusBadge({
  status,
}: {
  status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
}) {
  return (
    <span title={approvalStatusTitleEn(status)} lang="bn">
      <AdminBadge variant={approvalStatusBadgeVariant(status)}>
        {approvalStatusBn(status)}
      </AdminBadge>
    </span>
  );
}
