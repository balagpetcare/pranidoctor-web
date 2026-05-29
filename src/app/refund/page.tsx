import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — Prani Doctor",
};

export default function RefundPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral">
      <h1>Refund Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: May 2026</p>

      <h2>Consultation fees</h2>
      <p>
        If a paid consultation is cancelled by the assigned doctor before service
        begins, a full refund may be issued. If you cancel after acceptance, fees
        may be partially retained per service category rules.
      </p>

      <h2>How to request a refund</h2>
      <ol>
        <li>Open Support in the Prani Doctor app</li>
        <li>Reference your service request ID</li>
        <li>Our operations team reviews within 3–5 business days</li>
      </ol>

      <h2>Manual reconciliation</h2>
      <p>
        During pilot launch, some payments are reconciled manually. Refunds are
        processed to the original payment method when available, otherwise via
        agreed mobile financial service.
      </p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:billing@pranidoctor.com">billing@pranidoctor.com</a>
      </p>
    </main>
  );
}
