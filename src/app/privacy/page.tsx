import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Prani Doctor",
  description: "How Prani Doctor collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: May 2026</p>

      <h2>Overview</h2>
      <p>
        Prani Doctor (&quot;we&quot;, &quot;our&quot;) provides veterinary and livestock
        management services for farmers in Bangladesh. This policy explains what
        personal data we collect and how we use it.
      </p>

      <h2>Data we collect</h2>
      <ul>
        <li>Mobile phone number for OTP authentication</li>
        <li>Profile name, location (division/district/upazila), and farm details</li>
        <li>Animal health and production records you enter in the app</li>
        <li>Device identifiers for push notifications and security</li>
        <li>Support tickets and uploaded media you submit</li>
      </ul>

      <h2>How we use data</h2>
      <ul>
        <li>Authenticate you and secure your account</li>
        <li>Connect you with licensed veterinarians and service providers</li>
        <li>Provide feed, health, and farm management features</li>
        <li>Send service notifications (appointments, case updates)</li>
        <li>Improve platform reliability and safety</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        We share data with assigned doctors/technicians only as needed to deliver
        requested services. We do not sell personal data. Aggregated analytics
        exclude individual farm names.
      </p>

      <h2>Retention &amp; security</h2>
      <p>
        Data is stored on encrypted servers. OTP challenges expire automatically.
        You may request account deletion via in-app support.
      </p>

      <h2>Contact</h2>
      <p>
        Email: <a href="mailto:support@pranidoctor.com">support@pranidoctor.com</a>
      </p>
    </main>
  );
}
