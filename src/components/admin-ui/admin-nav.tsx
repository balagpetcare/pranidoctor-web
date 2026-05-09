import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  ClipboardList,
  Cpu,
  FileText,
  LayoutDashboard,
  MapPin,
  PawPrint,
  Pill,
  Settings,
  Stethoscope,
  Users,
  Wallet2,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  labelBn: string;
  titleEn: string;
  icon: LucideIcon;
};

/**
 * Primary admin navigation — Bangla labels, English tooltips.
 * Order: operational core first, then billing & content, then system.
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin",
    labelBn: "ড্যাশবোর্ড",
    titleEn: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/areas",
    labelBn: "এরিয়া",
    titleEn: "Areas",
    icon: MapPin,
  },
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
  {
    href: "/admin/customers",
    labelBn: "কাস্টমার",
    titleEn: "Customers",
    icon: Users,
  },
  {
    href: "/admin/service-requests",
    labelBn: "সার্ভিস রিকোয়েস্ট",
    titleEn: "Service requests",
    icon: ClipboardList,
  },
  {
    href: "/admin/animals",
    labelBn: "প্রাণীর প্রোফাইল",
    titleEn: "Animal profiles",
    icon: PawPrint,
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
  {
    href: "/admin/billing",
    labelBn: "বিলিং",
    titleEn: "Billing",
    icon: Wallet2,
  },
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
  {
    href: "/admin/settings",
    labelBn: "সেটিংস",
    titleEn: "Settings",
    icon: Settings,
  },
];

export function getSectionTitleFromPath(pathname: string): string {
  const normalized =
    pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  const sorted = [...ADMIN_NAV_ITEMS].sort((a, b) => b.href.length - a.href.length);
  for (const item of sorted) {
    const active =
      item.href === "/admin"
        ? normalized === "/admin"
        : normalized === item.href || normalized.startsWith(`${item.href}/`);
    if (active) return item.labelBn;
  }
  return ADMIN_NAV_ITEMS[0].labelBn;
}
