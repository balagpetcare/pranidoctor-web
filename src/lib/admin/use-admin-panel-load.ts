"use client";

import { useEffect } from "react";

/**
 * Runs an async panel loader after mount without synchronous setState in the effect body
 * (satisfies react-hooks/set-state-in-effect for admin data-fetch panels).
 */
export function useAdminPanelLoad(load: () => void | Promise<void>): void {
  useEffect(() => {
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      if (cancelled) return;
      void load();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [load]);
}
