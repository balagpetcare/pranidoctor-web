"use client";

import { useContext } from "react";

import { AdminThemeContext } from "./AdminThemeContext";

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error(
      "useAdminTheme must be used within an AdminThemeProvider (wrap the admin shell or layout).",
    );
  }
  return ctx;
}
