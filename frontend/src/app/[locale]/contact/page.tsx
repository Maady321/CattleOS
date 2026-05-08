import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | CattleOS",
  description: "Get in touch with the CattleOS team for support, sales inquiries, or to book a live demo of our smart cattle management platform.",
  alternates: {
    canonical: "/contact",
  },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "CattleOS",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@cattleos.com",
        "contactType": "customer service"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ContactClient />
    </>
  );
}
