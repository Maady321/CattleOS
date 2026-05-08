import { Metadata } from "next";
import CaseStudiesClient from "./CaseStudiesClient";

export const metadata: Metadata = {
  title: "Case Studies | CattleOS",
  description: "Real success stories from dairy farmers using CattleOS to optimize production and manage cattle health with digital precision.",
  alternates: {
    canonical: "/case-studies",
  },
};

export default function Page() {
  return <CaseStudiesClient />;
}
