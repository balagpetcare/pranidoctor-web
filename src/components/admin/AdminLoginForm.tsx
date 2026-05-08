"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { cn } from "@/lib/cn";

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

export function AdminLoginForm() {
  const router = useRouter();
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
        body: JSON.stringify({ email, password }),
      });
      const body = (await res.json()) as ApiEnvelope<{
        user: { id: string; email: string; displayName: string | null };
      }>;
      if (!body.ok) {
        setError(body.error.message);
        return;
      }
      const next = searchParams.get("next");
      const safe =
        next &&
        next.startsWith("/admin") &&
        !next.startsWith("//") &&
        !next.includes("://")
          ? next
          : "/admin";
      router.push(safe);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-sm space-y-5 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Admin sign in
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Prani Doctor operations console
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className={cn(
              "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
              "outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2",
              "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
            )}
          />
        </label>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className={cn(
              "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
              "outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2",
              "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
            )}
          />
        </label>
      </div>

      {error ? (
        <p
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "flex w-full justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white",
          "hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
