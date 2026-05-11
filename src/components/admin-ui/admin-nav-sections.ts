import type { AdminNavGroup } from "./admin-nav";

export type AdminNavSectionModel = Readonly<{
  id: string;
  titleBn: string;
  groups: AdminNavGroup[];
}>;

/**
 * Enterprise IA: visual section headers in the sidebar. Routes and groups are
 * unchanged — this only controls grouping order and Bengali section labels.
 */
const SECTION_SPECS: readonly { id: string; titleBn: string; groupIds: readonly string[] }[] = [
  { id: "sec-dash", titleBn: "ড্যাশবোর্ড", groupIds: ["overview"] },
  { id: "sec-loc", titleBn: "লোকেশন ও এরিয়া ব্যবস্থাপনা", groupIds: ["location-area"] },
  { id: "sec-med", titleBn: "মেডিকেল টিম", groupIds: ["medical-team"] },
  { id: "sec-ai", titleBn: "এআই টেকনিশিয়ান ব্যবস্থাপনা", groupIds: ["ai-technician-mgmt"] },
  { id: "sec-semen", titleBn: "সিমেন ও ব্রিডিং ব্যবস্থাপনা", groupIds: ["semen-breeding"] },
  { id: "sec-cust", titleBn: "গ্রাহক ও প্রাণীর রেকর্ড", groupIds: ["customer-animal"] },
  { id: "sec-svc", titleBn: "সেবা ও চিকিৎসা", groupIds: ["service-treatment"] },
  { id: "sec-fin", titleBn: "আর্থিক ব্যবস্থাপনা", groupIds: ["finance"] },
  { id: "sec-content", titleBn: "কন্টেন্ট ও যোগাযোগ", groupIds: ["content-comms"] },
  { id: "sec-sys", titleBn: "সিস্টেম ও ডেভেলপার", groupIds: ["developer-tools", "system"] },
];

export function getAdminNavSectionsForSidebar(groups: AdminNavGroup[]): AdminNavSectionModel[] {
  const byId = new Map(groups.map((g) => [g.id, g]));
  return SECTION_SPECS.map((spec) => ({
    id: spec.id,
    titleBn: spec.titleBn,
    groups: spec.groupIds.map((id) => byId.get(id)).filter((g): g is AdminNavGroup => Boolean(g)),
  })).filter((s) => s.groups.length > 0);
}

export function flattenSectionOrderedNavItems(sections: AdminNavSectionModel[]) {
  return sections.flatMap((s) => s.groups.flatMap((g) => g.children));
}
