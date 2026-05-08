import { Metadata } from "next";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog | CattleOS",
  description: "Stay updated with the latest in dairy farming technology, cattle health tips, and agricultural innovations from the CattleOS team.",
  alternates: {
    canonical: "/blog",
  },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "CattleOS Insights",
    "description": "Expert advice on cattle management and dairy farming technology."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <BlogClient />
    </>
  );
}
