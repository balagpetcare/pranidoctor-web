import type { AdminBadgeVariant } from "@/components/admin-ui/AdminBadge";
import {
  ServiceRequestStatus,
  ServiceRequestType,
} from "@/generated/prisma/browser";

export function serviceRequestStatusBn(status: string): string {
  switch (status as ServiceRequestStatus) {
    case ServiceRequestStatus.PENDING:
      return "অপেক্ষমাণ";
    case ServiceRequestStatus.ACCEPTED:
      return "গ্রহণ করা হয়েছে";
    case ServiceRequestStatus.ASSIGNED:
      return "বরাদ্দ";
    case ServiceRequestStatus.IN_PROGRESS:
      return "চলমান";
    case ServiceRequestStatus.COMPLETED:
      return "সম্পন্ন";
    case ServiceRequestStatus.CANCELLED:
      return "বাতিল";
    case ServiceRequestStatus.REJECTED:
      return "প্রত্যাখ্যাত";
    default:
      return status.replace(/_/g, " ");
  }
}

export function serviceRequestStatusBadgeVariant(
  status: string,
): AdminBadgeVariant {
  switch (status as ServiceRequestStatus) {
    case ServiceRequestStatus.COMPLETED:
      return "success";
    case ServiceRequestStatus.CANCELLED:
    case ServiceRequestStatus.REJECTED:
      return "neutral";
    case ServiceRequestStatus.PENDING:
      return "warning";
    case ServiceRequestStatus.IN_PROGRESS:
    case ServiceRequestStatus.ASSIGNED:
    case ServiceRequestStatus.ACCEPTED:
      return "info";
    default:
      return "default";
  }
}

export function serviceRequestTypeBn(t: string): string {
  switch (t as ServiceRequestType) {
    case ServiceRequestType.DOCTOR_HOME_VISIT:
      return "ডাক্তার হোম ভিজিট";
    case ServiceRequestType.EMERGENCY_DOCTOR:
      return "জরুরি ডাক্তার";
    case ServiceRequestType.AI_SERVICE:
      return "এআই সার্ভিস";
    case ServiceRequestType.ONLINE_CONSULTATION_LATER:
      return "অনলাইন পরামর্শ";
    default:
      return t.replace(/_/g, " ");
  }
}

/** True when request should show a visible emergency / priority cue. */
export function isEmergencyServiceRequest(row: {
  serviceType: string;
  isEmergency: boolean;
}): boolean {
  return (
    row.isEmergency ||
    (row.serviceType as ServiceRequestType) ===
      ServiceRequestType.EMERGENCY_DOCTOR
  );
}
