/**
 * Payment enum values — mirrors Prisma without importing generated client
 * in browser bundles (admin billing UI).
 */
export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  AUTHORIZED: "AUTHORIZED",
  CAPTURED: "CAPTURED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  CANCELLED: "CANCELLED",
  UNPAID: "UNPAID",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_METHOD = {
  CASH: "CASH",
  BKASH: "BKASH",
  NAGAD: "NAGAD",
  CARD: "CARD",
  BANK_TRANSFER: "BANK_TRANSFER",
  OTHER: "OTHER",
  ROCKET: "ROCKET",
  BANK: "BANK",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
