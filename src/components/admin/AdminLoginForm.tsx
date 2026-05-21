"use client";

import { PawPrint } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

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

export function AdminLoginForm() {
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
        setError(`${adminLoginErrorEn(code)} — ${adminLoginErrorBn(code)}`);
        return;
      }

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
        setError(`${adminLoginErrorEn(err.code)} — ${adminLoginErrorBn(err.code)}`);
      } else {
        setError(`${adminLoginErrorEn("server_error")} — ${adminLoginErrorBn("server_error")}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "mx-auto w-full max-w-sm space-y-6 rounded-2xl border border-emerald-900/10 bg-white/95 p-6 shadow-lg shadow-emerald-900/5 backdrop-blur-sm",
        "dark:border-emerald-500/15 dark:bg-zinc-900/95 dark:shadow-black/40",
        "sm:p-8",
      )}
    >
      <div className="flex justify-center sm:hidden">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
          <PawPrint className="h-5 w-5" aria-hidden />
        </span>
      </div>

      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50 sm:text-xl">
          Sign in
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Email or Bangladesh mobile number, and your password.
        </p>
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
          ইমেইল বা বাংলাদেশি মোবাইল নম্বর, এবং পাসওয়ার্ড।
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
          <span className="block">Email or phone / ইমেইল বা ফোন</span>
          <input
            type="text"
            name="identifier"
            autoComplete="username"
            required
            value={identifier}
            onChange={(ev) => setIdentifier(ev.target.value)}
            className={cn(
              "mt-1.5 block w-full min-h-11 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 sm:text-sm",
              "outline-none ring-emerald-600/30 focus:border-emerald-600 focus:ring-2",
              "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
            )}
            placeholder="admin@example.com or 017…"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
          <span className="block">Password / পাসওয়ার্ড</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            minLength={1}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className={cn(
              "mt-1.5 block w-full min-h-11 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 sm:text-sm",
              "outline-none ring-emerald-600/30 focus:border-emerald-600 focus:ring-2",
              "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
            )}
          />
        </label>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            name="remember"
            checked={remember}
            onChange={(ev) => setRemember(ev.target.checked)}
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600"
          />
          <span>
            Remember me on this device / এই ডিভাইসে মনে রাখুন
            {showRememberHelper ? (
              <span className="mt-0.5 block text-xs text-zinc-500">
                শুধু ইমেইল/ফোন সংরক্ষিত — পাসওয়ার্ড নয়। সেশন ৭ দিন পর্যন্ত সক্রিয় থাকতে পারে।
              </span>
            ) : null}
          </span>
        </label>
      </div>

      {notice ? (
        <p
          className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          {notice}
        </p>
      ) : null}

      {error ? (
        <p
          className="rounded-lg bg-red-50 px-3 py-2.5 text-sm leading-relaxed text-red-900 dark:bg-red-950/50 dark:text-red-100"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "flex min-h-11 w-full items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white",
          "hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600",
        )}
      >
        {loading ? "Signing in… / লগ ইন হচ্ছে…" : "Log in / প্রবেশ করুন"}
      </button>
    </form>
  );
}
