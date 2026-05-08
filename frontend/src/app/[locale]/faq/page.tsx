import { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "FAQ | CattleOS",
  description: "Frequently asked questions about CattleOS cattle management software. Learn about digital passports, milk tracking, pricing, and technical support.",
  alternates: {
    canonical: "/faq",
  },
};

export default function Page() {
  const faqs = [
    { q: "What is CattleOS?", a: "CattleOS is a premium AI-powered cattle management platform designed for modern dairy farms." },
    { q: "How does the digital cattle passport work?", a: "Every animal gets a unique QR code that links to its full health, ancestry, and production history." },
    { q: "Is CattleOS available in Malayalam?", a: "Yes, we offer full support for both Malayalam and English to ensure accessibility for all farmers in Kerala." }
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <FAQClient />
    </>
  );
}
