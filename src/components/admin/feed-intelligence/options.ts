export const FEED_INTELLIGENCE_NAV = [
  {
    href: "/admin/ai-ops/feed-intelligence",
    labelBn: "ওভারভিউ",
    titleEn: "Overview",
  },
  {
    href: "/admin/ai-ops/feed-intelligence/ingredients",
    labelBn: "খাদ্য উপাদান",
    titleEn: "Feed ingredients",
  },
  {
    href: "/admin/ai-ops/feed-intelligence/toxic-alerts",
    labelBn: "বিষাক্ত সতর্কতা",
    titleEn: "Toxic feed alerts",
  },
] as const;

export const VERSION_STATUS_OPTIONS = [
  { value: "", labelBn: "সব স্ট্যাটাস" },
  { value: "DRAFT", labelBn: "খসড়া" },
  { value: "IN_REVIEW", labelBn: "পর্যালোচনায়" },
  { value: "PUBLISHED", labelBn: "প্রকাশিত" },
  { value: "DEPRECATED", labelBn: "আর্কাইভ" },
] as const;

export function statusLabelBn(status: string): string {
  const found = VERSION_STATUS_OPTIONS.find((o) => o.value === status);
  return found?.labelBn ?? status;
}
