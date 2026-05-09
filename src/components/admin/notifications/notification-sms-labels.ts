import type { AdminBadgeVariant } from "@/components/admin-ui/AdminBadge";

import type { SmsAdminStatusSnapshot } from "@/lib/sms/service";

export function smsProviderValueBn(
  effective: SmsAdminStatusSnapshot["effectiveProvider"],
): string {
  switch (effective) {
    case "local":
      return "লোকাল লগ";
    case "noop":
      return "কোনো প্রেরণ নয়";
    case "http":
      return "প্রোডাকশন প্রোভাইডার";
    default:
      return effective;
  }
}

export function notificationTypeBn(type: string): string {
  switch (type) {
    case "REQUEST_UPDATE":
      return "সেবা অনুরোধ আপডেট";
    case "PAYMENT":
      return "পেমেন্ট";
    case "CHAT":
      return "চ্যাট";
    case "SYSTEM":
      return "সিস্টেম";
    case "MARKETING":
      return "মার্কেটিং";
    case "COMPLAINT":
      return "অভিযোগ";
    case "REVIEW":
      return "রিভিউ";
    default:
      return type.replace(/_/g, " ");
  }
}

export function inAppNotificationReadBadge(read: boolean): {
  label: string;
  variant: AdminBadgeVariant;
} {
  return read
    ? { label: "পঠিত", variant: "neutral" }
    : { label: "অপেক্ষমাণ", variant: "warning" };
}

/** Bangla + badge for effective SMS transport (no secrets). */
export function smsRuntimeBadges(snapshot: SmsAdminStatusSnapshot): {
  lines: string[];
  primaryBadge: { label: string; variant: AdminBadgeVariant };
  extraBadges: { label: string; variant: AdminBadgeVariant }[];
} {
  const extra: { label: string; variant: AdminBadgeVariant }[] = [];

  if (snapshot.unknownRawProvider) {
    extra.push({
      label: `অজানা SMS_PROVIDER (${snapshot.configuredProvider}) → noop`,
      variant: "danger",
    });
  }

  if (snapshot.httpIgnoredInNonProduction) {
    extra.push({
      label: "প্রোডাকশন ছাড়া HTTP এসএমএস বন্ধ → লোকাল লগ",
      variant: "warning",
    });
  }

  switch (snapshot.effectiveProvider) {
    case "local":
      return {
        lines: [
          "ওটিপি ও টেক্সট ডেভ সার্ভার লগে যায় (নেটওয়ার্কে প্রকৃত এসএমএস নয়)।",
          "লগ দেখতে টার্মিনাল/সার্ভার কনসোল ব্যবহার করুন।",
        ],
        primaryBadge: { label: "লোকাল লগ", variant: "info" },
        extraBadges: extra,
      };
    case "noop":
      return {
        lines: ["কোনো বাহ্যিক এসএমএস প্রেরক সক্রিয় নয়।"],
        primaryBadge: { label: "পাঠানো হবে না", variant: "neutral" },
        extraBadges: extra,
      };
    case "http": {
      const ok = snapshot.httpCredentialsConfigured;
      if (ok) {
        extra.push({
          label: "প্রোডাকশন প্রোভাইডার (HTTP) — ক্রেডেনশিয়াল সেট",
          variant: "success",
        });
        return {
          lines: [
            "প্রোডাকশনে HTTP প্রোভাইডারের মাধ্যমে ওটিপি ও বিজ্ঞপ্তি এসএমএস পাঠানো হয়।",
            "API কী বা URL এখানে দেখানো হয় না।",
          ],
          primaryBadge: { label: "পাঠানো হয়েছে (কনফিগার্ড)", variant: "success" },
          extraBadges: extra,
        };
      }
      extra.push({
        label: "ব্যর্থ — HTTP ক্রেডেনশিয়াল অসম্পূর্ণ",
        variant: "danger",
      });
      return {
        lines: [
          "SMS_HTTP_URL ও SMS_HTTP_API_KEY দুটোই সেট করতে হবে।",
          "মানগুলো এই পৃষ্ঠায় দেখানো হয় না।",
        ],
        primaryBadge: { label: "প্রোডাকশন প্রোভাইডার", variant: "warning" },
        extraBadges: extra,
      };
    }
    default:
      return {
        lines: [],
        primaryBadge: { label: snapshot.effectiveProvider, variant: "default" },
        extraBadges: extra,
      };
  }
}
