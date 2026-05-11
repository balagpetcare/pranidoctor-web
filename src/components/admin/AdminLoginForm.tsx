"use client";

import { PawPrint } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { getSafeAdminNextPath } from "@/lib/admin-auth/safe-next-path";
import { cn } from "@/lib/cn";

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

/** Maps API `error.code` from `POST /api/admin/auth/login`. */
function loginErrorBn(code: string): string {
  switch (code) {
    case "invalid_credentials":
      return "ভুল ইমেইল/ফোন বা পাসওয়ার্ড";
    case "db_unavailable":
      return "সার্ভারের সাথে সংযোগ করা যাচ্ছে না";
    case "server_error":
      return "সিস্টেম সাময়িকভাবে ব্যস্ত";
    case "INVALID_CREDENTIALS":
      return "ভুল ইমেইল/ফোন বা পাসওয়ার্ড";
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

function loginErrorEn(code: string): string {
  switch (code) {
    case "invalid_credentials":
      return "Incorrect email or phone, or password.";
    case "db_unavailable":
      return "We could not reach the database. Please try again shortly.";
    case "server_error":
      return "Something went wrong. Please try again in a moment.";
    case "INVALID_CREDENTIALS":
      return "Incorrect email or phone, or password.";
    case "DATABASE_UNAVAILABLE":
      return "We could not reach the database. Please try again shortly.";
    case "SERVER_MISCONFIGURED":
    case "VALIDATION_ERROR":
    case "INVALID_JSON":
      return "Something went wrong. Please try again in a moment.";
    default:
      return "Something went wrong. Please try again in a moment.";
  }
}

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const trimmed = identifier.trim();
      const payload: { password: string; email?: string; identifier?: string } =
        { password };
      if (trimmed.includes("@")) {
        payload.email = trimmed;
      } else {
        payload.identifier = trimmed;
      }

      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let body: unknown;
      try {
        body = await res.json();
      } catch {
        setError(`${loginErrorEn("UNKNOWN")} — ${loginErrorBn("server_error")}`);
        return;
      }

      const parsed = body as ApiEnvelope<{
        user: { id: string; email: string; displayName: string | null };
      }>;

      if (!parsed || typeof parsed !== "object" || !("ok" in parsed)) {
        setError(`${loginErrorEn("UNKNOWN")} — ${loginErrorBn("server_error")}`);
        return;
      }

      if (!parsed.ok) {
        const code = parsed.error.code;
        setError(`${loginErrorEn(code)} — ${loginErrorBn(code)}`);
        return;
      }

      const next = searchParams.get("next");
      window.location.assign(getSafeAdminNextPath(next));
    } catch {
      setError(`${loginErrorEn("UNKNOWN")} — ${loginErrorBn("server_error")}`);
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
      </div>

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
