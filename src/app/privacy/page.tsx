import type { Metadata } from "next";
import Link from "next/link";

import {
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_VERSION,
} from "@/lib/legal/privacy-policy-content";

export const metadata: Metadata = {
  title: "Privacy Policy — Prani Doctor",
  description: "How Prani Doctor collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-muted-foreground not-prose">
        Version {PRIVACY_POLICY_VERSION} · Effective 30 May 2026
      </p>

      {PRIVACY_POLICY_SECTIONS.map((section) => (
        <section key={section.id} id={section.id}>
          <h2>{section.title}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </section>
      ))}

      <p className="not-prose text-sm text-muted-foreground">
        <Link className="underline" href="/terms">
          Terms of Service
        </Link>
        {" · "}
        <a className="underline" href="mailto:support@pranidoctor.com">
          support@pranidoctor.com
        </a>
      </p>
    </main>
  );
}
