export const FEED_CATEGORY_OPTIONS = [
  { value: "ROUGHAGE", labelBn: "শুষ্ক খাদ্য", labelEn: "Roughage" },
  { value: "GREEN", labelBn: "সবুজ খাদ্য", labelEn: "Green" },
  { value: "CONCENTRATE", labelBn: "কেন্দ্রীভূত", labelEn: "Concentrate" },
  { value: "SUPPLEMENT", labelBn: "সম্পূরক", labelEn: "Supplement" },
  { value: "MINERAL", labelBn: "খনিজ", labelEn: "Mineral" },
  { value: "SILAGE", labelBn: "সাইলেজ", labelEn: "Silage" },
  { value: "CUSTOM", labelBn: "কাস্টম", labelEn: "Custom" },
] as const;

export const FEED_UNIT_OPTIONS = [
  { value: "KG", label: "কেজি (KG)" },
  { value: "BAG", label: "ব্যাগ" },
  { value: "BUNDLE", label: "বান্ডিল" },
  { value: "LITER", label: "লিটার" },
  { value: "OTHER", label: "অন্যান্য" },
] as const;
