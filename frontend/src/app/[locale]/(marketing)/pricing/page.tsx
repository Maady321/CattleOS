import { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing | CattleOS",
  description: "Flexible plans for dairy farms of all sizes. Choose the right plan for your herd and start optimizing your production today.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "CattleOS Subscription",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": "0",
      "highPrice": "4999",
      "offerCount": "3"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <PricingClient />
    </>
  );
}
