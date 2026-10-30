import type { MetadataRoute } from "next";
import { locales, localeMeta } from "@/i18n/config";
import { siteUrl } from "@/data/company";
import { categoryIds, collectionIds } from "@/data/taxonomy";
import { productPath, products } from "@/data/products";
import { articles } from "@/content/insights";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/about",
    "/services",
    "/products",
    ...collectionIds.map((c) => `/products/${c}`),
    ...categoryIds.map((c) => `/products/${c}`),
    ...products.map(productPath),
    "/customization-studio",
    "/factory",
    "/quality",
    "/how-it-works",
    "/faq",
    "/insights",
    ...articles.map((a) => `/insights/${a.slug}`),
    "/contact",
  ];
  const now = new Date();
  return paths.flatMap((p) =>
    locales.map((l) => ({
      url: `${siteUrl}/${l}${p}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : p.startsWith("/products/") ? 0.6 : 0.8,
      alternates: { languages: Object.fromEntries(locales.map((x) => [localeMeta[x].hreflang, `${siteUrl}/${x}${p}`])) },
    })),
  );
}
