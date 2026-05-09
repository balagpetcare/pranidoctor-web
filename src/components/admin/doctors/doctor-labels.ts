import type { AdminBadgeVariant } from "@/components/admin-ui/AdminBadge";

/** UI string from `verificationSummary()` in doctor-admin-service. */
export function doctorVerificationBn(key: string): string {
  switch (key) {
    case "REJECTED":
      return "প্রত্যাখ্যাত";
    case "SUSPENDED":
      return "সাসপেন্ডেড";
    case "PENDING_VERIFICATION":
      return "যাচাইয়ের অপেক্ষা";
    case "VERIFIED_PENDING_APPROVAL":
      return "যাচাইকৃত — অনুমোদন অপেক্ষমাণ";
    case "VERIFIED_ACTIVE":
      return "যাচাইকৃত ও সক্রিয়";
    case "APPROVED_ACTIVE":
      return "অনুমোদিত ও সক্রিয়";
    case "UNKNOWN":
      return "অজানা";
    default:
      return key.replace(/_/g, " ");
  }
}

export function verificationBadgeVariant(key: string): AdminBadgeVariant {
  switch (key) {
    case "VERIFIED_ACTIVE":
    case "APPROVED_ACTIVE":
      return "success";
    case "VERIFIED_PENDING_APPROVAL":
    case "PENDING_VERIFICATION":
      return "warning";
    case "REJECTED":
      return "danger";
    case "SUSPENDED":
      return "neutral";
    default:
      return "default";
  }
}

export function userStatusBn(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "সক্রিয়";
    case "SUSPENDED":
      return "সাসপেন্ডেড";
    case "PENDING_VERIFICATION":
      return "যাচাইয়ের অপেক্ষা";
    case "INVITED":
      return "আমন্ত্রিত";
    case "DELETED":
      return "মুছে ফেলা";
    default:
      return status;
  }
}

export function providerStatusBn(status: string): string {
  switch (status) {
    case "PENDING_VERIFICATION":
      return "অনুমোদন অপেক্ষমাণ";
    case "ACTIVE":
      return "সক্রিয়";
    case "SUSPENDED":
      return "সাসপেন্ডেড";
    case "REJECTED":
      return "প্রত্যাখ্যাত";
    default:
      return status;
  }
}

export function userStatusBadgeVariant(status: string): AdminBadgeVariant {
  if (status === "ACTIVE") return "success";
  if (status === "SUSPENDED") return "warning";
  return "neutral";
}

export function providerStatusBadgeVariant(status: string): AdminBadgeVariant {
  if (status === "ACTIVE") return "success";
  if (status === "PENDING_VERIFICATION") return "warning";
  if (status === "REJECTED") return "danger";
  if (status === "SUSPENDED") return "neutral";
  return "default";
}
