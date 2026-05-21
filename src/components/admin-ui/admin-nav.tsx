import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  Cpu,
  Dna,
  FileText,
  FlaskConical,
  FolderKanban,
  Globe2,
  Inbox,
  LayoutDashboard,
  Layers,
  ListTree,
  MapPin,
  MapPinned,
  MessageSquareWarning,
  PackageSearch,
  PawPrint,
  Pill,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
  UsersRound,
  Wallet2,
} from "lucide-react";

import { USER_ROLE, type UserRole } from "@/lib/admin-auth/user-role";
import type { ServiceInstanceAdminCapability } from "@/lib/admin-auth/permissions";

export type AdminNavItem = {
  href: string;
  labelBn: string;
  titleEn: string;
  icon: LucideIcon;
  /** Optional capability gate (enterprise review). */
  capability?: ServiceInstanceAdminCapability;
  /** Optional role allow-list; omit for all panel admins. */
  roles?: UserRole[];
  /** @deprecated Use `capability` / `roles` — kept for legacy callers. */
  permission?: string | string[];
};

export type AdminNavGroup = {
  id: string;
  /** English short label (tooltips / diagnostics). */
  labelEn: string;
  /** Bengali label for sidebar parent row (expanded). */
  labelBn: string;
  titleEn: string;
  icon: LucideIcon;
  children: AdminNavItem[];
};

/** @deprecated Prefer {@link filterAdminNavGroupsForActor} in the shell. */
export function navItemIsVisible(item: AdminNavItem): boolean {
  void item;
  return true;
}

export function filterAdminNavGroups(groups: AdminNavGroup[]): AdminNavGroup[] {
  return groups
    .map((g) => ({
      ...g,
      children: g.children.filter(navItemIsVisible),
    }))
    .filter((g) => g.children.length > 0);
}

export function flattenAdminNavGroups(groups: AdminNavGroup[]): AdminNavItem[] {
  return groups.flatMap((g) => g.children);
}

/**
 * Longest-prefix match so e.g. `/admin/ai-technicians/applications/...` activates
 * the applications item, not the shorter `/admin/ai-technicians` parent path.
 */
export function resolveAdminActiveHref(normalizedPath: string, items: AdminNavItem[]): string | null {
  const sorted = [...items].sort((a, b) => b.href.length - a.href.length);
  for (const item of sorted) {
    if (item.href === "/admin") {
      if (normalizedPath === "/admin") return "/admin";
    } else if (normalizedPath === item.href || normalizedPath.startsWith(`${item.href}/`)) {
      return item.href;
    }
  }
  return null;
}

/**
 * Primary admin navigation — Bangla labels on links, English section titles + tooltips.
 * Group order follows operational workflow; routes unchanged from the legacy flat list.
 */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "overview",
    labelEn: "Overview",
    labelBn: "ওভারভিউ",
    titleEn: "Overview — dashboard and summary",
    icon: LayoutDashboard,
    children: [
      {
        href: "/admin",
        labelBn: "ড্যাশবোর্ড",
        titleEn: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        href: "/admin/analytics",
        labelBn: "অ্যানালিটিক্স",
        titleEn: "Analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "location-area",
    labelEn: "Location & Area Management",
    labelBn: "লোকেশন ও এরিয়া",
    titleEn: "Areas and Bangladesh location master",
    icon: MapPinned,
    children: [
      {
        href: "/admin/areas",
        labelBn: "এরিয়া",
        titleEn: "Areas",
        icon: MapPin,
      },
      {
        href: "/admin/locations",
        labelBn: "লোকেশন মাস্টার",
        titleEn: "BD location master (CSV / verify)",
        icon: Globe2,
      },
    ],
  },
  {
    id: "medical-team",
    labelEn: "Medical Team",
    labelBn: "মেডিকেল টিম",
    titleEn: "Doctors and AI technicians",
    icon: UsersRound,
    children: [
      {
        href: "/admin/doctors",
        labelBn: "ডাক্তার",
        titleEn: "Doctors",
        icon: Stethoscope,
      },
      {
        href: "/admin/ai-technicians",
        labelBn: "এআই টেকনিশিয়ান",
        titleEn: "AI Technicians",
        icon: Cpu,
      },
    ],
  },
  {
    id: "ai-technician-mgmt",
    labelEn: "AI Technician Operations",
    labelBn: "এআই অপারেশন",
    titleEn: "Applications, complaints, and enterprise review",
    icon: FolderKanban,
    children: [
      {
        href: "/admin/ai-technicians/applications",
        labelBn: "এআই আবেদন",
        titleEn: "AI technician applications",
        icon: Inbox,
      },
      {
        href: "/admin/ai-technician-complaints",
        labelBn: "এআই অভিযোগ",
        titleEn: "AI technician complaints",
        icon: MessageSquareWarning,
      },
      {
        href: "/enterprise/services/review",
        labelBn: "এন্টারপ্রাইজ সেবা পর্যালোচনা",
        titleEn: "Enterprise service instance review",
        icon: ClipboardList,
        capability: "serviceInstance.view",
      },
    ],
  },
  {
    id: "semen-breeding",
    labelEn: "Semen / Breeding Management",
    labelBn: "সিমেন ও ব্রিডিং",
    titleEn: "Semen providers, breeds, and service templates",
    icon: Layers,
    children: [
      {
        href: "/admin/semen-providers",
        labelBn: "সিমেন প্রদানকারী",
        titleEn: "Semen providers (master)",
        icon: PackageSearch,
      },
      {
        href: "/admin/livestock-breeds",
        labelBn: "পশুর জাত",
        titleEn: "Livestock breeds (master)",
        icon: Dna,
      },
      {
        href: "/admin/semen-service-templates",
        labelBn: "সিমেন টেমপ্লেট",
        titleEn: "Semen service templates",
        icon: PackageSearch,
      },
    ],
  },
  {
    id: "customer-animal",
    labelEn: "Customer & Animal Records",
    labelBn: "গ্রাহক ও প্রাণী",
    titleEn: "Customers and animal profiles",
    icon: Users,
    children: [
      {
        href: "/admin/customers",
        labelBn: "ইউজার / কাস্টমার",
        titleEn: "Users / Customers",
        icon: Users,
      },
      {
        href: "/admin/animals",
        labelBn: "প্রাণীর প্রোফাইল",
        titleEn: "Animal profiles",
        icon: PawPrint,
      },
    ],
  },
  {
    id: "service-treatment",
    labelEn: "Service & Treatment",
    labelBn: "সেবা ও চিকিৎসা",
    titleEn: "Service requests, treatment records, prescriptions",
    icon: ClipboardList,
    children: [
      {
        href: "/admin/service-requests",
        labelBn: "সার্ভিস রিকোয়েস্ট",
        titleEn: "Service requests",
        icon: ClipboardList,
      },
      {
        href: "/admin/cases",
        labelBn: "কেস",
        titleEn: "Cases (service requests)",
        icon: FolderKanban,
      },
      {
        href: "/admin/appointments",
        labelBn: "অ্যাপয়েন্টমেন্ট",
        titleEn: "Appointments (service requests)",
        icon: Inbox,
      },
      {
        href: "/admin/reports",
        labelBn: "চিকিৎসা রেকর্ড",
        titleEn: "Treatment records",
        icon: FileText,
      },
      {
        href: "/admin/prescriptions",
        labelBn: "প্রেসক্রিপশন",
        titleEn: "Prescriptions",
        icon: Pill,
      },
    ],
  },
  {
    id: "finance",
    labelEn: "Finance",
    labelBn: "আর্থিক",
    titleEn: "Billing",
    icon: Wallet2,
    children: [
      {
        href: "/admin/billing",
        labelBn: "বিলিং",
        titleEn: "Billing",
        icon: Wallet2,
      },
    ],
  },
  {
    id: "content-comms",
    labelEn: "Content & Communication",
    labelBn: "কন্টেন্ট ও যোগাযোগ",
    titleEn: "Knowledge Hub and notifications",
    icon: BookOpen,
    children: [
      {
        href: "/admin/knowledge-hub",
        labelBn: "নলেজ হাব",
        titleEn: "Knowledge Hub",
        icon: BookOpen,
      },
      {
        href: "/admin/notifications",
        labelBn: "নোটিফিকেশন ও SMS",
        titleEn: "Notifications & SMS",
        icon: Bell,
      },
    ],
  },
  {
    id: "developer-tools",
    labelEn: "Developer Tools",
    labelBn: "ডেভেলপার টুলস",
    titleEn: "Development and diagnostics",
    icon: FlaskConical,
    children: [
      {
        href: "/admin/dev-tools/otp-logs",
        labelBn: "(ডেভ) OTP লগ",
        titleEn: "Dev OTP logs",
        icon: FlaskConical,
        roles: [USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN],
      },
      {
        href: "/admin/audit",
        labelBn: "অডিট",
        titleEn: "Audit hub",
        icon: ShieldCheck,
        roles: [USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN],
      },
    ],
  },
  {
    id: "system",
    labelEn: "System",
    labelBn: "সিস্টেম",
    titleEn: "Admin settings and configuration",
    icon: Settings,
    children: [
      {
        href: "/admin/service-categories",
        labelBn: "সার্ভিস ক্যাটাগরি",
        titleEn: "Service categories (master)",
        icon: ListTree,
      },
      {
        href: "/admin/settings",
        labelBn: "সেটিংস",
        titleEn: "Settings",
        icon: Settings,
      },
      {
        href: "/admin/settings/roles",
        labelBn: "ভূমিকা",
        titleEn: "Roles (read-only)",
        icon: ShieldCheck,
      },
      {
        href: "/admin/settings/permissions",
        labelBn: "অনুমতি",
        titleEn: "Permissions (read-only)",
        icon: ShieldCheck,
      },
    ],
  },
];

/** Flattened nav items (legacy export); same routes and order as the grouped config. */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = flattenAdminNavGroups(ADMIN_NAV_GROUPS);

export function getSectionTitleFromPath(pathname: string): string {
  const normalized =
    pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  if (normalized.startsWith("/enterprise")) {
    const sorted = [...ADMIN_NAV_ITEMS].sort((a, b) => b.href.length - a.href.length);
    for (const item of sorted) {
      if (!item.href.startsWith("/enterprise")) continue;
      if (normalized === item.href || normalized.startsWith(`${item.href}/`)) {
        return item.labelBn;
      }
    }
    const tab = normalized.split("/").pop();
    const tabLabels: Record<string, string> = {
      pending: "অপেক্ষমাণ",
      "needs-correction": "সংশোধন",
      approved: "অনুমোদিত",
      published: "প্রকাশিত",
      archived: "আর্কাইভ",
    };
    if (tab && tabLabels[tab]) {
      return tabLabels[tab]!;
    }
    return "এন্টারপ্রাইজ";
  }
  const activeHref = resolveAdminActiveHref(normalized, ADMIN_NAV_ITEMS);
  if (activeHref) {
    const hit = ADMIN_NAV_ITEMS.find((i) => i.href === activeHref);
    if (hit) return hit.labelBn;
  }
  return ADMIN_NAV_ITEMS[0].labelBn;
}
