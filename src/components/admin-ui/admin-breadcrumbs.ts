import {
  ADMIN_NAV_ITEMS,
  resolveAdminActiveHref,
  type AdminNavItem,
} from "./admin-nav";

export type AdminBreadcrumbCrumb = {
  href?: string;
  label: string;
};

const ACTION_LABELS: Record<string, string> = {
  new: "নতুন",
  edit: "সম্পাদনা",
};

const ENTERPRISE_TAB_LABELS: Record<string, string> = {
  pending: "অপেক্ষমাণ",
  "needs-correction": "সংশোধন",
  approved: "অনুমোদিত",
  published: "প্রকাশিত",
  archived: "আর্কাইভ",
  rejected: "প্রত্যাখ্যাত",
  draft: "খসড়া",
};

const EXTRA_SEGMENTS: Record<string, string> = {
  "missing-coords": "কোঅর্ডিনেট বিহীন",
  "pending-verification": "অনিরীক্ষিত",
  categories: "ক্যাটাগরি",
  posts: "পোস্ট",
  billing: "বিলিং সেটিংস",
  "otp-logs": "OTP লগ",
  "service-categories": "সার্ভিস ক্যাটাগরি",
  applications: "আবেদন",
  analytics: "অ্যানালিটিক্স",
  audit: "অডিট",
  cases: "কেস",
  appointments: "অ্যাপয়েন্টমেন্ট",
  users: "ইউজার",
  roles: "ভূমিকা",
  permissions: "অনুমতি",
  "ai-ops": "এআই সেন্টার",
  "ai-technician-complaints": "এআই অভিযোগ",
  marketplace: "মার্কেটপ্লেস",
  logs: "লগ",
  routes: "রাউটিং",
  "api-keys": "API কী",
  prompts: "প্রম্পট",
  providers: "প্রোভাইডার",
  models: "মডেল",
  health: "হেলথ",
  "semen-providers": "সিমেন প্রদানকারী",
  "livestock-breeds": "পশুর জাত",
  "semen-service-templates": "সিমেন টেমপ্লেট",
  "service-requests": "সার্ভিস রিকোয়েস্ট",
  "knowledge-hub": "নলেজ হাব",
  "dev-tools": "ডেভ টুলস",
  doctors: "ডাক্তার",
  "ai-technicians": "এআই টেকনিশিয়ান",
  locations: "লোকেশন মাস্টার",
  areas: "এরিয়া",
  customers: "কাস্টমার",
  animals: "প্রাণী",
  reports: "চিকিৎসা রেকর্ড",
  prescriptions: "প্রেসক্রিপশন",
  notifications: "নোটিফিকেশন",
  settings: "সেটিংস",
  review: "সেবা পর্যালোচনা",
  services: "সেবা",
};

function normalizePath(pathname: string): string {
  if (!pathname) return "/admin";
  if (pathname.endsWith("/") && pathname !== "/") {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function findNavItem(path: string): AdminNavItem | undefined {
  const href = resolveAdminActiveHref(path, ADMIN_NAV_ITEMS);
  return href ? ADMIN_NAV_ITEMS.find((i) => i.href === href) : undefined;
}

function isLikelyId(segment: string): boolean {
  return /^[a-z0-9-]{8,}$/i.test(segment) || /^\d+$/.test(segment);
}

/**
 * Builds a Bengali breadcrumb trail for admin and enterprise dashboard routes.
 */
export function buildAdminBreadcrumbs(pathname: string): AdminBreadcrumbCrumb[] {
  const normalized = normalizePath(pathname);
  const crumbs: AdminBreadcrumbCrumb[] = [{ href: "/admin", label: "ড্যাশবোর্ড" }];

  if (normalized === "/admin") {
    return crumbs;
  }

  if (normalized.startsWith("/enterprise")) {
    crumbs.push({ href: "/enterprise/services/review", label: "এন্টারপ্রাইজ সেবা পর্যালোচনা" });
    const tab = normalized.split("/").pop();
    if (tab && tab !== "review" && ENTERPRISE_TAB_LABELS[tab]) {
      crumbs.push({ label: ENTERPRISE_TAB_LABELS[tab]! });
    }
    return crumbs;
  }

  const navHit = findNavItem(normalized);
  if (navHit && navHit.href !== "/admin") {
    crumbs.push({ href: navHit.href, label: navHit.labelBn });
  }

  const parts = normalized.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  if (parts.length === 0) {
    return crumbs;
  }

  const lastNav = navHit?.href.replace(/^\/admin\/?/, "").split("/").filter(Boolean) ?? [];
  const tail = parts.slice(lastNav.length);

  for (let i = 0; i < tail.length; i++) {
    const seg = tail[i]!;
    if (ACTION_LABELS[seg]) {
      crumbs.push({ label: ACTION_LABELS[seg]! });
      continue;
    }
    if (ENTERPRISE_TAB_LABELS[seg]) {
      crumbs.push({ label: ENTERPRISE_TAB_LABELS[seg]! });
      continue;
    }
    if (EXTRA_SEGMENTS[seg] && i === 0 && !navHit) {
      const prefix = `/admin/${parts.slice(0, lastNav.length + i + 1).join("/")}`;
      crumbs.push({ href: prefix, label: EXTRA_SEGMENTS[seg]! });
      continue;
    }
    if (isLikelyId(seg)) {
      crumbs.push({ label: "বিস্তারিত" });
      continue;
    }
    if (EXTRA_SEGMENTS[seg]) {
      crumbs.push({ label: EXTRA_SEGMENTS[seg]! });
    }
  }

  return crumbs;
}
