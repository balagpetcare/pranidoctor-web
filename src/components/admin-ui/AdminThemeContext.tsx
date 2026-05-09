"use client";

import { createContext } from "react";

import type {
  AdminAppearance,
  AdminContentWidth,
  AdminSidebarMode,
  AdminSidebarTheme,
  AdminThemeState,
} from "./admin-theme-types";

export type AdminThemeContextValue = Readonly<
  AdminThemeState & {
    setAppearance: (v: AdminAppearance) => void;
    setSidebarMode: (v: AdminSidebarMode) => void;
    setSidebarTheme: (v: AdminSidebarTheme) => void;
    setContentWidth: (v: AdminContentWidth) => void;
    setTopbarSticky: (v: boolean) => void;
    setFooterVisible: (v: boolean) => void;
    resetAdminTheme: () => void;
  }
>;

export const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);
