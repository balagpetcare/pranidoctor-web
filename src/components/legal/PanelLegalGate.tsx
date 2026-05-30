"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  AdminLegalRequirement,
  AdminLegalStatus,
} from "@/lib/admin-legal/admin-legal-api";

type PanelLegalGateProps = {
  enabled: boolean;
  title: string;
  description: string;
  fetchStatus: () => Promise<AdminLegalStatus>;
  acceptDocument: (input: {
    documentKey: string;
    version: string;
  }) => Promise<AdminLegalStatus>;
  onAccepted?: () => void | Promise<void>;
};

function BlockingOverlay({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {onRetry ? (
          <button
            type="button"
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            onClick={onRetry}
          >
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function PanelLegalGate({
  enabled,
  title,
  description,
  fetchStatus,
  acceptDocument,
  onAccepted,
}: PanelLegalGateProps) {
  const [legal, setLegal] = useState<AdminLegalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStatus();
      setLegal(data);
    } catch {
      setError("Could not load legal compliance status.");
      setLegal(null);
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled, load]);

  if (!enabled) {
    return null;
  }

  async function accept(doc: AdminLegalRequirement) {
    setAccepting(true);
    setError(null);
    try {
      const next = await acceptDocument({
        documentKey: doc.documentKey,
        version: doc.version,
      });
      setLegal(next);
      await onAccepted?.();
    } catch {
      setError("Acceptance failed. Please try again.");
    } finally {
      setAccepting(false);
    }
  }

  if (!enabled) return null;

  if (loading) {
    return (
      <BlockingOverlay
        title={title}
        message="Verifying legal compliance…"
      />
    );
  }

  if (error && !legal) {
    return (
      <BlockingOverlay
        title={title}
        message={error}
        onRetry={() => void load()}
      />
    );
  }

  if (legal?.allAccepted !== false) {
    return null;
  }

  const pending = legal?.pendingDocuments ?? [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border bg-background p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {pending.map((doc) => (
          <section key={doc.documentKey} className="mt-4 rounded-md border p-3 text-sm">
            <p className="font-medium">{doc.title}</p>
            <p className="text-muted-foreground">Version {doc.version}</p>
            {doc.publicUrl ? (
              <a
                className="text-primary mt-2 inline-block underline"
                href={doc.publicUrl}
                target="_blank"
                rel="noreferrer"
              >
                Read full document
              </a>
            ) : null}
          </section>
        ))}
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <button
          type="button"
          disabled={accepting || pending.length === 0}
          className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          onClick={() => {
            const doc = pending[0];
            if (doc) void accept(doc);
          }}
        >
          {accepting ? "Saving…" : "I accept — continue"}
        </button>
      </div>
    </div>
  );
}
