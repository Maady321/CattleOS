import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us | CattleOS",
  description: "The mission behind CattleOS: Empowering dairy farmers through modern technology, AI insights, and digital governance for livestock.",
  alternates: {
    canonical: "/about",
  },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "CattleOS",
      "description": "Premium AI-powered cattle management platform.",
      "foundingDate": "2024",
      "location": {
        "@type": "Place",
        "name": "Kerala, India"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <AboutClient />
    </>
  );
}
