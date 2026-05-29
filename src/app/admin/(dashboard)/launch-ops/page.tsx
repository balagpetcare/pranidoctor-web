"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProbeResult = {
  label: string;
  url: string;
  status: number | null;
  ok: boolean;
  body?: string;
};

async function probe(url: string): Promise<ProbeResult> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    return {
      label: url,
      url,
      status: res.status,
      ok: res.ok,
      body: text.slice(0, 200),
    };
  } catch {
    return { label: url, url, status: null, ok: false };
  }
}

export default function LaunchOpsPage() {
  const [results, setResults] = useState<ProbeResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const targets = [
        "/api/health",
        "/api/health/live",
        "/api/health/ready",
        "/api/admin/health/ready",
        "/api/admin/uptime",
      ];
      const out = await Promise.all(targets.map((t) => probe(t)));
      if (!cancelled) {
        setResults(out);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Launch Operations</h1>
        <p className="text-muted-foreground text-sm">
          Pre-launch health probes, legal links, and runbook shortcuts.
        </p>
      </div>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium mb-3">Health probes</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Running probes…</p>
        ) : (
          <ul className="space-y-2 text-sm font-mono">
            {results.map((r) => (
              <li key={r.url} className="flex flex-wrap gap-2 items-center">
                <span className={r.ok ? "text-green-600" : "text-red-600"}>
                  {r.status ?? "ERR"}
                </span>
                <span>{r.url}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="font-medium mb-3">Public legal pages</h2>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>
            <Link className="text-primary underline" href="/privacy">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link className="text-primary underline" href="/terms">
              Terms of Service
            </Link>
          </li>
          <li>
            <Link className="text-primary underline" href="/refund">
              Refund Policy
            </Link>
          </li>
          <li>
            <Link className="text-primary underline" href="/legal/disclaimer">
              Veterinary Disclaimer
            </Link>
          </li>
        </ul>
      </section>

      <section className="rounded-lg border p-4 text-sm text-muted-foreground">
        <h2 className="font-medium text-foreground mb-2">Runbooks</h2>
        <p>
          See repository docs: <code>docs/deployment/</code>,{" "}
          <code>docs/security/</code>, <code>docs/launch/</code>
        </p>
      </section>
    </div>
  );
}
