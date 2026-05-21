import {
  SERVICE_REQUEST_STATUS,
  type ServiceRequestStatus,
} from "@/lib/domain/service-request-constants";

/** Request must be assigned to this doctor and open for clinical documentation. */
export const DOCTOR_CLINICAL_REQUEST_STATUSES: ServiceRequestStatus[] = [
  SERVICE_REQUEST_STATUS.ASSIGNED,
  SERVICE_REQUEST_STATUS.ACCEPTED,
  SERVICE_REQUEST_STATUS.IN_PROGRESS,
];

/** Doctor may mark the service request completed from these statuses (same as clinical writes). */
export const DOCTOR_CASE_COMPLETABLE_STATUSES: ServiceRequestStatus[] =
  DOCTOR_CLINICAL_REQUEST_STATUSES;
