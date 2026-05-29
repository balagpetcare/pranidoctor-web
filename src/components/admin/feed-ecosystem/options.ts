export const FEED_CATEGORY_OPTIONS = [
  { value: 'ROUGHAGE', labelBn: 'শুষ্ক খাদ্য', labelEn: 'Roughage' },
  { value: 'GREEN', labelBn: 'সবুজ খাদ্য', labelEn: 'Green' },
  { value: 'CONCENTRATE', labelBn: 'কেন্দ্রীভূত', labelEn: 'Concentrate' },
  { value: 'SUPPLEMENT', labelBn: 'সম্পূরক', labelEn: 'Supplement' },
  { value: 'MINERAL', labelBn: 'খনিজ', labelEn: 'Mineral' },
  { value: 'SILAGE', labelBn: 'সাইলেজ', labelEn: 'Silage' },
  { value: 'CUSTOM', labelBn: 'কাস্টম', labelEn: 'Custom' },
] as const;

export const FEED_UNIT_OPTIONS = [
  { value: 'KG', label: 'কেজি (KG)' },
  { value: 'BAG', label: 'ব্যাগ' },
  { value: 'BUNDLE', label: 'বান্ডিল' },
  { value: 'LITER', label: 'লিটার' },
  { value: 'OTHER', label: 'অন্যান্য' },
] as const;

export const FEED_MOISTURE_OPTIONS = [
  { value: 'DRY', labelBn: 'শুষ্ক', labelEn: 'Dry' },
  { value: 'FRESH', labelBn: 'তাজা', labelEn: 'Fresh' },
  { value: 'WET', labelBn: 'ভেজা', labelEn: 'Wet' },
] as const;

export const VENDOR_STATUS_OPTIONS = [
  { value: 'PENDING', labelBn: 'অপেক্ষমান', labelEn: 'Pending' },
  { value: 'VERIFIED', labelBn: 'যাচাইকৃত', labelEn: 'Verified' },
  { value: 'REJECTED', labelBn: 'প্রত্যাখ্যাত', labelEn: 'Rejected' },
] as const;

export const FEED_ECOSYSTEM_NAV = [
  { href: '/admin/feed-ecosystem', labelBn: 'সারাংশ', titleEn: 'Overview' },
  { href: '/admin/feed-ecosystem/categories', labelBn: 'ক্যাটাগরি', titleEn: 'Feed categories' },
  { href: '/admin/feed-ecosystem/items', labelBn: 'খাদ্য আইটেম', titleEn: 'Feed items' },
  { href: '/admin/feed-ecosystem/nutrition', labelBn: 'পুষ্টি', titleEn: 'Nutrition' },
  { href: '/admin/feed-ecosystem/vendors', labelBn: 'ভেন্ডর', titleEn: 'Vendors' },
  { href: '/admin/feed-ecosystem/inventory', labelBn: 'ইনভেন্টরি', titleEn: 'Inventory monitor' },
  { href: '/admin/feed-ecosystem/analytics', labelBn: 'অ্যানালিটিক্স', titleEn: 'Feed analytics' },
  { href: '/admin/feed-ecosystem/livestock', labelBn: 'পশু পরিসংখ্যান', titleEn: 'Livestock stats' },
  { href: '/admin/feed-ecosystem/recommendations', labelBn: 'সুপারিশ নিয়ম', titleEn: 'Recommendation rules' },
  { href: '/admin/feed-ecosystem/seed', labelBn: 'সিড ডেটা', titleEn: 'Seed management' },
  { href: '/admin/feed-ecosystem/moderation', labelBn: 'অনুমোদন', titleEn: 'Moderation' },
] as const;

export function categoryLabelBn(value: string): string {
  return FEED_CATEGORY_OPTIONS.find((c) => c.value === value)?.labelBn ?? value;
}

export function vendorStatusLabelBn(value: string): string {
  return VENDOR_STATUS_OPTIONS.find((s) => s.value === value)?.labelBn ?? value;
}
