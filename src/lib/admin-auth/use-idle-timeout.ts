"use client";

import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"] as const;

/**
 * Signs the admin out after `timeoutMs` without user activity.
 * Resets on common interaction events.
 */
export function useIdleTimeout(options: {
  enabled: boolean;
  timeoutMs: number;
  onIdle: () => void;
}): void {
  const onIdleRef = useRef(options.onIdle);

  useEffect(() => {
    onIdleRef.current = options.onIdle;
  }, [options.onIdle]);

  useEffect(() => {
    if (!options.enabled || options.timeoutMs <= 0) {
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;

    const reset = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        onIdleRef.current();
      }, options.timeoutMs);
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, reset, { passive: true });
    }
    reset();

    return () => {
      if (timer) clearTimeout(timer);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, reset);
      }
    };
  }, [options.enabled, options.timeoutMs]);
}
