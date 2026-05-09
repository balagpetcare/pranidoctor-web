"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ADMIN_UI_STORAGE_KEY,
  DEFAULT_ADMIN_THEME,
  parseAdminThemeFromStorage,
  serializeAdminTheme,
  type AdminAppearance,
  type AdminContentWidth,
  type AdminSidebarMode,
  type AdminSidebarTheme,
  type AdminThemeState,
} from "./admin-theme-types";
import { AdminThemeContext, type AdminThemeContextValue } from "./AdminThemeContext";

function readStorage(): AdminThemeState {
  if (typeof window === "undefined") {
    return DEFAULT_ADMIN_THEME;
  }
  try {
    return parseAdminThemeFromStorage(window.localStorage.getItem(ADMIN_UI_STORAGE_KEY));
  } catch {
    return DEFAULT_ADMIN_THEME;
  }
}

function writeStorage(state: AdminThemeState): void {
  try {
    window.localStorage.setItem(ADMIN_UI_STORAGE_KEY, serializeAdminTheme(state));
  } catch {
    /* ignore quota / private mode */
  }
}

export function AdminThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [state, setState] = useState<AdminThemeState>(() => DEFAULT_ADMIN_THEME);
  const skipNextPersist = useRef(true);

  useEffect(() => {
    queueMicrotask(() => {
      setState(readStorage());
    });
  }, []);

  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    writeStorage(state);
  }, [state]);

  const setAppearance = useCallback((appearance: AdminAppearance) => {
    setState((s) => ({ ...s, appearance }));
  }, []);

  const setSidebarMode = useCallback((sidebarMode: AdminSidebarMode) => {
    setState((s) => ({ ...s, sidebarMode }));
  }, []);

  const setSidebarTheme = useCallback((sidebarTheme: AdminSidebarTheme) => {
    setState((s) => ({ ...s, sidebarTheme }));
  }, []);

  const setContentWidth = useCallback((contentWidth: AdminContentWidth) => {
    setState((s) => ({ ...s, contentWidth }));
  }, []);

  const setTopbarSticky = useCallback((topbarSticky: boolean) => {
    setState((s) => ({ ...s, topbarSticky }));
  }, []);

  const setFooterVisible = useCallback((footerVisible: boolean) => {
    setState((s) => ({ ...s, footerVisible }));
  }, []);

  const resetAdminTheme = useCallback(() => {
    setState(DEFAULT_ADMIN_THEME);
    try {
      window.localStorage.removeItem(ADMIN_UI_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<AdminThemeContextValue>(
    () => ({
      ...state,
      setAppearance,
      setSidebarMode,
      setSidebarTheme,
      setContentWidth,
      setTopbarSticky,
      setFooterVisible,
      resetAdminTheme,
    }),
    [
      state,
      setAppearance,
      setSidebarMode,
      setSidebarTheme,
      setContentWidth,
      setTopbarSticky,
      setFooterVisible,
      resetAdminTheme,
    ],
  );

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
}
