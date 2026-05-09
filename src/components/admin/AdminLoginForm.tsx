"use client";

import { PawPrint } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { getSafeAdminNextPath } from "@/lib/admin-auth/safe-next-path";
import { cn } from "@/lib/cn";

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

/** Bengali-first copy; maps API `error.code` from `POST /api/admin/auth/login`. */
function loginErrorBn(code: string): string {
  switch (code) {
    case "invalid_credentials":
      return "ভুল ইমেইল বা পাসওয়ার্ড";
    case "db_unavailable":
      return "সার্ভারের সাথে সংযোগ করা যাচ্ছে না";
    case "server_error":
      return "সিস্টেম সাময়িকভাবে ব্যস্ত";
    // Legacy codes (older deployments / cached bundles)
    case "INVALID_CREDENTIALS":
      return "ভুল ইমেইল বা পাসওয়ার্ড";
    case "DATABASE_UNAVAILABLE":
      return "সার্ভারের সাথে সংযোগ করা যাচ্ছে না";
    case "SERVER_MISCONFIGURED":
    case "VALIDATION_ERROR":
    case "INVALID_JSON":
      return "সিস্টেম সাময়িকভাবে ব্যস্ত";
    default:
      return "সিস্টেম সাময়িকভাবে ব্যস্ত";
  }
}

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let body: unknown;
      try {
        body = await res.json();
      } catch {
        setError(loginErrorBn("UNKNOWN"));
        return;
      }

      const parsed = body as ApiEnvelope<{
        user: { id: string; email: string; displayName: string | null };
      }>;

      if (!parsed || typeof parsed !== "object" || !("ok" in parsed)) {
        setError(loginErrorBn("UNKNOWN"));
        return;
      }

      if (!parsed.ok) {
        setError(loginErrorBn(parsed.error.code));
        return;
      }

      const next = searchParams.get("next");
      window.location.assign(getSafeAdminNextPath(next));
    } catch {
      setError(loginErrorBn("UNKNOWN"));
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
        <h1 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50 sm:text-xl">
          প্রাণী ডাক্তার অ্যাডমিন
        </h1>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          পশুচিকিৎসা ও সেবা ব্যবস্থাপনার জন্য নিরাপদ প্রবেশ
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          Prani Doctor — operations sign-in
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
          <span className="block">ইমেইল</span>
          <span className="sr-only">Email</span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            inputMode="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className={cn(
              "mt-1.5 block w-full min-h-11 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 sm:text-sm",
              "outline-none ring-emerald-600/30 focus:border-emerald-600 focus:ring-2",
              "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
            )}
            placeholder="you@example.com"
          />
        </label>
        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
          <span className="block">পাসওয়ার্ড</span>
          <span className="sr-only">Password</span>
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
      </div>

      {error ? (
        <p
          className="rounded-lg bg-red-50 px-3 py-2.5 text-sm leading-relaxed text-red-900 dark:bg-red-950/50 dark:text-red-100"
          role="alert"
          lang="bn"
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
        {loading ? "লগ ইন হচ্ছে…" : "প্রবেশ করুন"}
      </button>
    </form>
  );
}
