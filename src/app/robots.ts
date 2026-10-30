import type { MetadataRoute } from "next";
import { siteUrl } from "@/data/company";

export default function robots(): MetadataRoute.Robots {
  // Set ALLOW_INDEXING=true when the site is publicly launched; previews stay out of search engines.
  const allow = process.env.ALLOW_INDEXING === "true";
  return {
    rules: allow ? [{ userAgent: "*", allow: "/", disallow: ["/api/", "/*/inquiry"] }] : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
