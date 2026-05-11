import type { AdminBadgeVariant } from "@/components/admin-ui/AdminBadge";

import {
  AI_TECHNICIAN_STATUS,
  type AiTechnicianApplicationStatus,
} from "./ai-technician-status-constants";

const bn: Record<AiTechnicianApplicationStatus, string> = {
  [AI_TECHNICIAN_STATUS.DRAFT]: "খসড়া",
  [AI_TECHNICIAN_STATUS.SUBMITTED]: "জমাকৃত",
  [AI_TECHNICIAN_STATUS.UNDER_REVIEW]: "পর্যালোচনাধীন",
  [AI_TECHNICIAN_STATUS.NEEDS_CORRECTION]: "সংশোধন প্রয়োজন",
  [AI_TECHNICIAN_STATUS.APPROVED]: "অনুমোদিত",
  [AI_TECHNICIAN_STATUS.PUBLISHED]: "প্রকাশিত",
  [AI_TECHNICIAN_STATUS.REJECTED]: "প্রত্যাখ্যাত",
  [AI_TECHNICIAN_STATUS.SUSPENDED]: "স্থগিত",
};

export function applicationStatusBn(s: AiTechnicianApplicationStatus): string {
  return bn[s] ?? s;
}

export function applicationStatusBadgeVariant(
  s: AiTechnicianApplicationStatus,
): AdminBadgeVariant {
  switch (s) {
    case AI_TECHNICIAN_STATUS.DRAFT:
      return "neutral";
    case AI_TECHNICIAN_STATUS.SUBMITTED:
      return "warning";
    case AI_TECHNICIAN_STATUS.UNDER_REVIEW:
      return "warning";
    case AI_TECHNICIAN_STATUS.NEEDS_CORRECTION:
      return "warning";
    case AI_TECHNICIAN_STATUS.APPROVED:
      return "success";
    case AI_TECHNICIAN_STATUS.PUBLISHED:
      return "success";
    case AI_TECHNICIAN_STATUS.REJECTED:
      return "danger";
    case AI_TECHNICIAN_STATUS.SUSPENDED:
      return "danger";
    default:
      return "neutral";
  }
}
