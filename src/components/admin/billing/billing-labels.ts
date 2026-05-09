import type { AdminBadgeVariant } from "@/components/admin-ui/AdminBadge";

/** BDT display — uses bn-BD grouping; amounts are still numeric from API. */
export function formatBdt(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return `৳${n.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function paymentStatusBn(status: string): string {
  switch (status) {
    case "PENDING":
      return "অপেক্ষমাণ";
    case "AUTHORIZED":
      return "অনুমোদিত";
    case "CAPTURED":
      return "ক্যাপচারড";
    case "FAILED":
      return "ব্যর্থ";
    case "REFUNDED":
      return "ফেরত";
    case "CANCELLED":
      return "বাতিল";
    case "UNPAID":
      return "অশোধিত";
    case "PARTIAL":
      return "আংশিক পরিশোধ";
    case "PAID":
      return "পরিশোধিত";
    default:
      return status.replace(/_/g, " ");
  }
}

export function paymentStatusBadgeVariant(status: string): AdminBadgeVariant {
  switch (status) {
    case "PAID":
    case "CAPTURED":
      return "success";
    case "PARTIAL":
    case "AUTHORIZED":
      return "info";
    case "PENDING":
    case "UNPAID":
      return "warning";
    case "FAILED":
    case "CANCELLED":
    case "REFUNDED":
      return "neutral";
    default:
      return "default";
  }
}

export function paymentMethodBn(method: string | null): string {
  if (!method) return "—";
  switch (method) {
    case "CASH":
      return "নগদ";
    case "BKASH":
      return "বিকাশ";
    case "NAGAD":
      return "নগাদ";
    case "ROCKET":
      return "রকেট";
    case "CARD":
      return "কার্ড";
    case "BANK_TRANSFER":
      return "ব্যাংক ট্রান্সফার";
    case "BANK":
      return "ব্যাংক";
    case "OTHER":
      return "অন্যান্য";
    default:
      return method.replace(/_/g, " ");
  }
}

export function billingStatusBn(status: string): string {
  switch (status) {
    case "DRAFT":
      return "খসড়া";
    case "ISSUED":
      return "ইস্যু";
    case "PARTIALLY_PAID":
      return "আংশিক পরিশোধ";
    case "PAID":
      return "পরিশোধিত";
    case "VOIDED":
      return "বাতিল (ভয়েড)";
    case "REFUNDED":
      return "ফেরত";
    default:
      return status.replace(/_/g, " ");
  }
}
