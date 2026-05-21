"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { UserRole } from "@/lib/admin-auth/user-role";

import {
  adminLoginRequest,
  adminLogoutRequest,
  adminRefreshSessionRequest,
} from "./auth-api";
import { adminCan, type ServiceInstanceAdminCapability } from "./permissions-core";
import {
  clearRememberedIdentifier,
  saveRememberedIdentifier,
} from "./remember-login";
import {
  ADMIN_IDLE_TIMEOUT_MS,
  ADMIN_SESSION_REFRESH_INTERVAL_MS,
} from "./session-config";
import type {
  AdminAuthContextValue,
  AdminAuthStatus,
  AdminLoginPayload,
  AdminSessionUser,
} from "./types";
import { useIdleTimeout } from "./use-idle-timeout";

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export type AdminAuthProviderProps = Readonly<{
  children: React.ReactNode;
  /** When true, restore session on mount and run refresh / idle timers. */
  active?: boolean;
}>;

export function AdminAuthProvider({ children, active = true }: AdminAuthProviderProps) {
  const [status, setStatus] = useState<AdminAuthStatus>(active ? "loading" : "unauthenticated");
  const [user, setUser] = useState<AdminSessionUser | null>(null);
  const [syncing, setSyncing] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshSession = useCallback(async (): Promise<AdminSessionUser | null> => {
    if (!active) return null;
    setSyncing(true);
    try {
      const me = await adminRefreshSessionRequest();
      if (mountedRef.current) {
        setUser(me);
        setStatus("authenticated");
      }
      return me;
    } catch {
      if (mountedRef.current) {
        setUser(null);
        setStatus("unauthenticated");
      }
      return null;
    } finally {
      if (mountedRef.current) {
        setSyncing(false);
      }
    }
  }, [active]);

  const syncProfile = refreshSession;

  const logout = useCallback(
    async (reason: "manual" | "idle" | "expired" = "manual") => {
      try {
        await adminLogoutRequest();
      } catch {
        /* cookie may already be cleared */
      }
      if (mountedRef.current) {
        setUser(null);
        setStatus("unauthenticated");
      }
      const params = new URLSearchParams();
      if (reason === "idle") {
        params.set("reason", "idle");
      } else if (reason === "expired") {
        params.set("reason", "expired");
      }
      const qs = params.toString();
      window.location.href = qs ? `/admin/login?${qs}` : "/admin/login";
    },
    [],
  );

  const login = useCallback(
    async (payload: AdminLoginPayload, remember = false) => {
      const result = await adminLoginRequest(payload);
      if (remember) {
        const id = payload.email?.trim() || payload.identifier?.trim() || "";
        if (id) saveRememberedIdentifier(id);
      } else {
        clearRememberedIdentifier();
      }
      if (mountedRef.current) {
        setUser(result.user);
        setStatus("authenticated");
      }
      return result;
    },
    [],
  );

  const can = useCallback(
    (capability: ServiceInstanceAdminCapability) => {
      if (!user) return false;
      return adminCan(user, capability);
    },
    [user],
  );

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user],
  );

  // Session restore on mount (deferred to avoid sync setState inside effect body)
  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => {
      void refreshSession();
    }, 0);
    return () => window.clearTimeout(id);
  }, [active, refreshSession]);

  // Periodic session refresh (backend touchJwtSession via /me)
  useEffect(() => {
    if (!active || status !== "authenticated") return;
    const id = window.setInterval(() => {
      void refreshSession();
    }, ADMIN_SESSION_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [active, status, refreshSession]);

  // Idle timeout
  useIdleTimeout({
    enabled: active && status === "authenticated",
    timeoutMs: ADMIN_IDLE_TIMEOUT_MS,
    onIdle: () => {
      void logout("idle");
    },
  });

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      status,
      user,
      syncing,
      login,
      logout,
      refreshSession,
      syncProfile,
      can,
      hasRole,
    }),
    [status, user, syncing, login, logout, refreshSession, syncProfile, can, hasRole],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}

/** Optional hook — returns null outside provider (e.g. login page). */
export function useAdminAuthOptional(): AdminAuthContextValue | null {
  return useContext(AdminAuthContext);
}
