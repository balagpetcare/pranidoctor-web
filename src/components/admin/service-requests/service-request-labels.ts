import type { AdminBadgeVariant } from "@/components/admin-ui/AdminBadge";
import {
  SERVICE_REQUEST_STATUS,
  type ServiceRequestStatus,
  SERVICE_REQUEST_TYPE,
  type ServiceRequestType,
} from "@/lib/domain/service-request-constants";

export function serviceRequestStatusBn(status: string): string {
  switch (status as ServiceRequestStatus) {
    case SERVICE_REQUEST_STATUS.PENDING:
      return "অপেক্ষমাণ";
    case SERVICE_REQUEST_STATUS.ACCEPTED:
      return "গ্রহণ করা হয়েছে";
    case SERVICE_REQUEST_STATUS.ASSIGNED:
      return "বরাদ্দ";
    case SERVICE_REQUEST_STATUS.IN_PROGRESS:
      return "চলমান";
    case SERVICE_REQUEST_STATUS.COMPLETED:
      return "সম্পন্ন";
    case SERVICE_REQUEST_STATUS.CANCELLED:
      return "বাতিল";
    case SERVICE_REQUEST_STATUS.REJECTED:
      return "প্রত্যাখ্যাত";
    default:
      return status.replace(/_/g, " ");
  }
}

export function serviceRequestStatusBadgeVariant(
  status: string,
): AdminBadgeVariant {
  switch (status as ServiceRequestStatus) {
    case SERVICE_REQUEST_STATUS.COMPLETED:
      return "success";
    case SERVICE_REQUEST_STATUS.CANCELLED:
    case SERVICE_REQUEST_STATUS.REJECTED:
      return "neutral";
    case SERVICE_REQUEST_STATUS.PENDING:
      return "warning";
    case SERVICE_REQUEST_STATUS.IN_PROGRESS:
    case SERVICE_REQUEST_STATUS.ASSIGNED:
    case SERVICE_REQUEST_STATUS.ACCEPTED:
      return "info";
    default:
      return "default";
  }
}

export function serviceRequestTypeBn(t: string): string {
  switch (t as ServiceRequestType) {
    case SERVICE_REQUEST_TYPE.DOCTOR_HOME_VISIT:
      return "ডাক্তার হোম ভিজিট";
    case SERVICE_REQUEST_TYPE.EMERGENCY_DOCTOR:
      return "জরুরি ডাক্তার";
    case SERVICE_REQUEST_TYPE.AI_SERVICE:
      return "এআই সার্ভিস";
    case SERVICE_REQUEST_TYPE.ONLINE_CONSULTATION_LATER:
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
      SERVICE_REQUEST_TYPE.EMERGENCY_DOCTOR
  );
}
