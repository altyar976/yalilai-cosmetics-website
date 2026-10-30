import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 960, 1200, 1600, 2000],
    imageSizes: [64, 96, 128, 200, 280, 360],
    qualities: [60, 72, 80, 88],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  // The earlier concept catalogue used these category slugs; send old links to the new catalogue.
  async redirects() {
    const old = "mascara|lip-gloss|lip-liner|lipstick|face|eyes|prep-care";
    return [
      { source: `/:locale(en|zh-cn)/products/:cat(${old})`, destination: "/:locale/products", permanent: true },
      { source: `/:locale(en|zh-cn)/products/:cat(${old})/:slug`, destination: "/:locale/products", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
