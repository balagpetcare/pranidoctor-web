import type { AdminBadgeVariant } from "@/components/admin-ui/AdminBadge";

/** ContentPost approval status — BN labels for admin UI. */
export function approvalStatusBn(status: string): string {
  switch (status) {
    case "DRAFT":
      return "খসড়া";
    case "PENDING_REVIEW":
      return "অনুমোদন অপেক্ষমাণ";
    case "APPROVED":
      return "অনুমোদিত";
    case "REJECTED":
      return "বাতিল";
    default:
      return status.replace(/_/g, " ");
  }
}

/** English `title` tooltips for badges (unchanged semantics). */
export function approvalStatusTitleEn(status: string): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "PENDING_REVIEW":
      return "Pending review";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

export function approvalStatusBadgeVariant(status: string): AdminBadgeVariant {
  switch (status) {
    case "APPROVED":
      return "success";
    case "PENDING_REVIEW":
      return "warning";
    case "REJECTED":
      return "danger";
    case "DRAFT":
      return "neutral";
    default:
      return "default";
  }
}
