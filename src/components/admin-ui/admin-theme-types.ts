export const ADMIN_UI_STORAGE_KEY = "pd-admin-ui-v1" as const;

export const ADMIN_THEME_SCHEMA_VERSION = 1 as const;

export type AdminAppearance = "light" | "dark" | "system";

export type AdminSidebarMode = "expanded" | "collapsed";

export type AdminSidebarTheme = "dark" | "light";

export type AdminContentWidth = "contained" | "full";

export type AdminThemeState = Readonly<{
  schemaVersion: typeof ADMIN_THEME_SCHEMA_VERSION;
  appearance: AdminAppearance;
  sidebarMode: AdminSidebarMode;
  sidebarTheme: AdminSidebarTheme;
  contentWidth: AdminContentWidth;
  topbarSticky: boolean;
  footerVisible: boolean;
}>;

export const DEFAULT_ADMIN_THEME: AdminThemeState = {
  schemaVersion: ADMIN_THEME_SCHEMA_VERSION,
  appearance: "system",
  sidebarMode: "expanded",
  sidebarTheme: "light",
  contentWidth: "contained",
  topbarSticky: false,
  footerVisible: false,
};

function isAppearance(v: unknown): v is AdminAppearance {
  return v === "light" || v === "dark" || v === "system";
}

function isSidebarMode(v: unknown): v is AdminSidebarMode {
  return v === "expanded" || v === "collapsed";
}

function isSidebarTheme(v: unknown): v is AdminSidebarTheme {
  return v === "dark" || v === "light";
}

function isContentWidth(v: unknown): v is AdminContentWidth {
  return v === "contained" || v === "full";
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}

/** Merge persisted JSON with defaults; invalid or missing fields fall back to defaults. */
export function parseAdminThemeFromStorage(raw: string | null): AdminThemeState {
  if (!raw) {
    return DEFAULT_ADMIN_THEME;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_ADMIN_THEME;
    }
    const o = parsed as Record<string, unknown>;
    return {
      schemaVersion: ADMIN_THEME_SCHEMA_VERSION,
      appearance: isAppearance(o.appearance) ? o.appearance : DEFAULT_ADMIN_THEME.appearance,
      sidebarMode: isSidebarMode(o.sidebarMode) ? o.sidebarMode : DEFAULT_ADMIN_THEME.sidebarMode,
      sidebarTheme: isSidebarTheme(o.sidebarTheme)
        ? o.sidebarTheme
        : DEFAULT_ADMIN_THEME.sidebarTheme,
      contentWidth: isContentWidth(o.contentWidth)
        ? o.contentWidth
        : DEFAULT_ADMIN_THEME.contentWidth,
      topbarSticky: isBoolean(o.topbarSticky) ? o.topbarSticky : DEFAULT_ADMIN_THEME.topbarSticky,
      footerVisible: isBoolean(o.footerVisible)
        ? o.footerVisible
        : DEFAULT_ADMIN_THEME.footerVisible,
    };
  } catch {
    return DEFAULT_ADMIN_THEME;
  }
}

export function serializeAdminTheme(state: AdminThemeState): string {
  return JSON.stringify(state);
}
