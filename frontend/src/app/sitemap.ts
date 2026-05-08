import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://cattle0s.netlify.app";
  const locales = ["en", "ml"];
  const pages = ["", "features", "pricing", "about", "contact", "faq", "blog", "case-studies"];

  const entries: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    pages.forEach((page) => {
      const url = `${baseUrl}/${locale}${page ? `/${page}` : ""}`;
      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: page === "" ? 1 : 0.8,
      });
    });
  });

  return entries;
}