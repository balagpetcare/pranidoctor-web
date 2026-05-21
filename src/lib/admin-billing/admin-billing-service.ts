/** DTO shapes for admin billing UI (API consumer — backend owns persistence). */
import type { PaymentMethod, PaymentStatus } from "@/lib/domain/payment-constants";

export type AdminBillingMoneyFields = {
  serviceFee: number;
  travelCost: number;
  medicineCost: number;
  discount: number;
  totalCollected: number;
  platformCommission: number;
  providerPayout: number;
};

export type AdminBillingListItemDto = AdminBillingMoneyFields & {
  id: string;
  serviceRequestId: string;
  doctor?: { displayName?: string | null } | null;
  customer: { displayName: string };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type AdminBillingDetailDto = AdminBillingMoneyFields & {
  id: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  billingStatus: string;
  issuedAt?: string | null;
  paidAt?: string | null;
  notes?: string | null;
  commissionFormula: { title: string; lines: string[] };
  serviceRequestId: string;
  serviceRequest?: {
    status: string;
    serviceType: string;
    animal?: { name: string; species: string };
  } | null;
  treatmentCaseId?: string | null;
  doctor?: { id: string; displayName?: string | null } | null;
  customer: { displayName: string; userEmail?: string | null };
  treatmentCase?: { status: string; diagnosis?: string | null } | null;
  createdAt: string;
  updatedAt: string;
};
