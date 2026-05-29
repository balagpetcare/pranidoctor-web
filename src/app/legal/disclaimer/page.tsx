import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Veterinary Disclaimer — Prani Doctor",
};

export default function VeterinaryDisclaimerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral">
      <h1>Veterinary &amp; AI Disclaimer</h1>

      <h2>Not emergency care</h2>
      <p>
        Prani Doctor does not provide emergency veterinary services. For life-threatening
        conditions, contact a licensed veterinarian immediately or visit the nearest
        veterinary facility.
      </p>

      <h2>AI-assisted features</h2>
      <p>
        AI chat, feed recommendations, and triage tools offer educational guidance
        only. They do not replace examination, diagnosis, or prescription by a
        licensed veterinarian.
      </p>

      <h2>Doctor services</h2>
      <p>
        Teleconsultations depend on information you provide. Doctors may recommend
        in-person visits when remote assessment is insufficient.
      </p>
    </main>
  );
}
