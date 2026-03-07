import type { MetadataRoute } from "next";

const BASE_URL = "https://quickfigure.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["en", "ko"];
  const routes = [
    "",
    "/tools/word-counter",
    "/tools/case-converter",
    "/tools/lorem-ipsum-generator",
    "/tools/password-generator",
    "/tools/json-formatter",
    "/tools/base64-encoder-decoder",
    "/blog",
    "/blog/how-to-count-words-in-essay",
    "/blog/json-formatting-best-practices",
    "/blog/how-to-create-strong-passwords",
    "/blog/understanding-base64-encoding",
    "/blog/text-case-conversion-guide",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1 : route.startsWith("/tools") ? 0.9 : 0.5,
      });
    }
  }

  return entries;
}
