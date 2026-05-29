/** Public privacy policy sections for /privacy page. Version must match mobile.legal.config. */
export const PRIVACY_POLICY_VERSION = "2026-05-30";

export const PRIVACY_POLICY_SECTIONS: Array<{ id: string; title: string; body: string[] }> = [
  {
    id: "overview",
    title: "Overview",
    body: [
      'Prani Doctor ("we", "our") provides veterinary and livestock management services for farmers in Bangladesh. This policy explains what personal data we collect, how we use it, and your choices.',
    ],
  },
  {
    id: "collection",
    title: "Information we collect",
    body: [
      "Account: name, mobile phone, optional email, password (stored hashed).",
      "Location: administrative hierarchy (division, district, upazila, village) and visit location notes.",
      "Animals & farm: species, health, production, and financial records you enter.",
      "Clinical: symptoms, consultations, prescriptions when you book veterinary services.",
      "Device: device identifier, platform, app version, optional push notification token.",
      "AI: chat messages and limited farm/animal context when you use AI features.",
      "Security: IP address, user agent, and authentication audit events.",
    ],
  },
  {
    id: "use",
    title: "How we use information",
    body: [
      "Authenticate you and deliver requested veterinary and farm services.",
      "Connect you with assigned doctors or technicians.",
      "Send transactional notifications about appointments and cases.",
      "Operate AI assistive features (informational only — not a diagnosis).",
      "Improve reliability and security of the platform.",
    ],
  },
  {
    id: "sharing",
    title: "Sharing",
    body: [
      "We share data with assigned doctors/technicians as needed to perform services.",
      "We use cloud hosting, SMS, push (Firebase), and AI providers (OpenAI/Anthropic) as processors.",
      "We do not sell personal data.",
    ],
  },
  {
    id: "ai",
    title: "AI processing",
    body: [
      "AI features may send your messages and limited animal/farm context to third-party LLM providers.",
      "Separate consent is requested before first use of AI features.",
      "AI output is not a substitute for a licensed veterinarian.",
    ],
  },
  {
    id: "retention",
    title: "Retention & security",
    body: [
      "Data is stored on encrypted servers. OTP codes expire automatically.",
      "Clinical records may be retained longer where law or care continuity requires.",
      "See our retention schedule documentation for detail.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    body: [
      "You may access, correct, or request deletion of your account data by contacting support@pranidoctor.com.",
      "You may opt out of marketing notifications in app Settings.",
      "We respond to verified requests within 30 days.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: ["Email: support@pranidoctor.com"],
  },
];
