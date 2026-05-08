import { Metadata } from "next";
import FeaturesClient from "./FeaturesClient";

export const metadata: Metadata = {
  title: "Features | CattleOS",
  description: "Explore the advanced features of CattleOS: QR digital passports, health monitoring, milk analytics, and AI-powered farm management.",
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "Features | CattleOS",
    description: "AI-powered cattle management features for the modern dairy farm.",
    url: "https://cattle0s.netlify.app/features",
    type: "website",
  },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "CattleOS Features",
    "description": "Comprehensive cattle management platform featuring health tracking, milk analytics, and digital passports.",
    "provider": {
      "@type": "Organization",
      "name": "CattleOS",
      "url": "https://cattle0s.netlify.app"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <FeaturesClient />
    </>
  );
}
