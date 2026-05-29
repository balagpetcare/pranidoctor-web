import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Prani Doctor",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral">
      <h1>Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated: May 2026</p>

      <h2>Acceptance</h2>
      <p>
        By using Prani Doctor mobile app or web services, you agree to these terms.
        If you do not agree, do not use the platform.
      </p>

      <h2>Service scope</h2>
      <p>
        Prani Doctor facilitates connections between farmers, veterinarians, and
        allied service providers. The platform is not a substitute for emergency
        in-person veterinary care.
      </p>

      <h2>User responsibilities</h2>
      <ul>
        <li>Provide accurate animal and contact information</li>
        <li>Use the app only for lawful livestock and veterinary purposes</li>
        <li>Do not misuse doctor or technician contact details</li>
      </ul>

      <h2>Payments</h2>
      <p>
        Fees for consultations and services are disclosed before booking where
        applicable. Refunds are handled per our Refund Policy and admin review.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        Prani Doctor is a technology platform. Licensed professionals are
        responsible for clinical decisions. See Veterinary Disclaimer in the app.
      </p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:support@pranidoctor.com">support@pranidoctor.com</a>
      </p>
    </main>
  );
}
