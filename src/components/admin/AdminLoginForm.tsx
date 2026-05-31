"use client";

import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { AdminLoginBrandLogo } from "@/components/admin/login/AdminLoginBrandLogo";
import { AdminLoginCheckbox } from "@/components/admin/login/AdminLoginCheckbox";
import { AdminLoginFloatingInput } from "@/components/admin/login/AdminLoginFloatingInput";
import { AdminAuthError } from "@/lib/admin-auth/auth-api";
import {
  adminLoginErrorBn,
  adminLoginErrorEn,
  adminLoginRedirectMessage,
} from "@/lib/admin-auth/login-messages";
import {
  clearRememberedIdentifier,
  loadRememberedIdentifier,
  saveRememberedIdentifier,
} from "@/lib/admin-auth/remember-login";
import { getSafeAdminNextPath } from "@/lib/admin-auth/safe-next-path";
import { cn } from "@/lib/cn";
import { AdminMonitoringEvent } from "@/lib/monitoring/admin-events";
import { trackAdminAuthEvent } from "@/lib/monitoring/admin-monitoring-client";

const SUPPORT_EMAIL = "support@pranidoctor.com";

type AdminLoginFormProps = {
  platformVersion?: string;
};

export function AdminLoginForm({
  platformVersion = "0.1.0",
}: AdminLoginFormProps) {
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showRememberHelper, setShowRememberHelper] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clearedReason, setClearedReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const reason = searchParams.get("reason");
  const redirectNotice = useMemo(
    () => adminLoginRedirectMessage(reason),
    [reason],
  );
  const notice = clearedReason === reason ? null : redirectNotice;

  useEffect(() => {
    const saved = loadRememberedIdentifier();
    if (!saved) return;
    setIdentifier(saved);
    setRemember(true);
    setShowRememberHelper(true);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setClearedReason(reason);
    setLoading(true);
    try {
      const trimmed = identifier.trim();
      const payload: { password: string; email?: string; identifier?: string } = {
        password,
      };
      if (trimmed.includes("@")) {
        payload.email = trimmed;
      } else {
        payload.identifier = trimmed;
      }

      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      let body: unknown;
      try {
        body = await res.json();
      } catch {
        setError(`${adminLoginErrorEn("server_error")} — ${adminLoginErrorBn("server_error")}`);
        return;
      }

      const parsed = body as
        | { ok: true; data: { user: unknown } }
        | { ok: false; error: { code: string; message: string } };

      if (!parsed || typeof parsed !== "object" || !("ok" in parsed)) {
        setError(`${adminLoginErrorEn("server_error")} — ${adminLoginErrorBn("server_error")}`);
        return;
      }

      if (!parsed.ok) {
        const code = parsed.error.code;
        trackAdminAuthEvent(AdminMonitoringEvent.AUTH_LOGIN_FAILURE, {
          reason: code,
          status: res.status,
        });
        setError(`${adminLoginErrorEn(code)} — ${adminLoginErrorBn(code)}`);
        return;
      }

      trackAdminAuthEvent(AdminMonitoringEvent.AUTH_LOGIN_SUCCESS);

      if (remember && trimmed) {
        saveRememberedIdentifier(trimmed);
      } else {
        clearRememberedIdentifier();
        setShowRememberHelper(false);
      }

      const next = searchParams.get("next");
      window.location.assign(getSafeAdminNextPath(next));
    } catch (err) {
      if (err instanceof AdminAuthError) {
        trackAdminAuthEvent(AdminMonitoringEvent.AUTH_LOGIN_FAILURE, {
          reason: err.code,
        });
        setError(`${adminLoginErrorEn(err.code)} — ${adminLoginErrorBn(err.code)}`);
      } else {
        trackAdminAuthEvent(AdminMonitoringEvent.AUTH_LOGIN_FAILURE, {
          reason: "network",
        });
        setError(`${adminLoginErrorEn("server_error")} — ${adminLoginErrorBn("server_error")}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pd-admin-login-card-enter mx-auto w-full max-w-[480px]">
      <div className="pd-admin-login-glass rounded-[24px] p-6 sm:p-8">
        <AdminLoginBrandLogo />

        <header className="mt-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">
            Welcome Back
          </h2>
          <p className="mt-1 text-sm font-medium text-[#374151]">
            Admin Dashboard Access
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[#6B7280]">
            Authorized staff only — use your admin email or Bangladesh mobile number.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]" lang="bn">
            শুধুমাত্র অনুমোদিত অ্যাডমিন — ইমেইল বা মোবাইল নম্বর ব্যবহার করুন।
          </p>
        </header>

        <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate={false}>
          <AdminLoginFloatingInput
            label="Email or phone"
            labelBn="ইমেইল বা ফোন"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            value={identifier}
            onChange={(ev) => setIdentifier(ev.target.value)}
            icon={Mail}
            invalid={Boolean(error)}
            placeholder=" "
          />

          <AdminLoginFloatingInput
            label="Password"
            labelBn="পাসওয়ার্ড"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={1}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            icon={Lock}
            invalid={Boolean(error)}
            showPasswordToggle
            placeholder=" "
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <AdminLoginCheckbox
              name="remember"
              checked={remember}
              onChange={(ev) => setRemember(ev.target.checked)}
              label={
                <>
                  Remember me on this device
                  <span className="block text-xs text-[#6B7280]" lang="bn">
                    এই ডিভাইসে মনে রাখুন
                  </span>
                  {showRememberHelper ? (
                    <span className="mt-1 block text-xs text-[#9CA3AF]" lang="bn">
                      শুধু ইমেইল/ফোন সংরক্ষিত — পাসওয়ার্ড নয়। সেশন ৭ দিন পর্যন্ত সক্রিয়
                      থাকতে পারে।
                    </span>
                  ) : null}
                </>
              }
            />
          </div>

          {notice ? (
            <p
              className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950"
              role="status"
            >
              {notice}
            </p>
          ) : null}

          {error ? (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-900"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "pd-admin-login-btn-primary flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white",
              "disabled:cursor-not-allowed disabled:opacity-65",
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                <span>Signing in… / লগ ইন হচ্ছে…</span>
              </>
            ) : (
              "Log in / প্রবেশ করুন"
            )}
          </button>

          <div className="flex flex-col items-center justify-center gap-2 pt-1 text-sm sm:flex-row sm:gap-4">
            <Link
              href={`mailto:${SUPPORT_EMAIL}?subject=Admin%20password%20reset%20request`}
              className="font-medium text-[#0F8F5F] underline-offset-4 transition-colors hover:text-[#14B87A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F8F5F]"
            >
              Forgot Password
            </Link>
            <span className="hidden text-[#D1D5DB] sm:inline" aria-hidden>
              |
            </span>
            <Link
              href={`mailto:${SUPPORT_EMAIL}?subject=Admin%20access%20request`}
              className="font-medium text-[#0F8F5F] underline-offset-4 transition-colors hover:text-[#14B87A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F8F5F]"
            >
              Contact Administrator
            </Link>
          </div>
        </form>

        <footer className="mt-8 space-y-4 border-t border-[#E5E7EB] pt-6">
          <div className="flex gap-3 rounded-xl bg-[#F5FAF7] p-4">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-[#0F8F5F]"
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold text-[#111827]">Security Notice</p>
              <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">
                This is a restricted admin environment. All sign-in attempts are
                monitored and logged for security compliance.
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]" lang="bn">
                এটি একটি সুরক্ষিত অ্যাডমিন পরিবেশ — সকল লগইন চেষ্টা নিরাপত্তার জন্য
                রেকর্ড করা হয়।
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-center text-xs text-[#9CA3AF] sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p>Platform version {platformVersion}</p>
            <p>
              Support:{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-[#0F8F5F] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F8F5F]"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
