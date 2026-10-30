import type { L } from "./taxonomy";

/**
 * Certification marks for the home-page "Quality & process" section.
 *
 * Nothing here is published until BOTH fields are filled in for an entry:
 *  - `logo`     — the exact logo file authorised by the issuing body (SVG preferred), placed in
 *                 /public/images/certifications/. Never a redrawn, AI-generated or screenshot copy.
 *  - `document` — the certificate / registration number held on file, so the claim can be shown
 *                 to any customer who asks.
 *
 * Order follows the approved design reference: Halal · FDA · ISO 9001:2015 · GMP · HACCP.
 * Set NEXT_PUBLIC_CERTIFICATIONS_PREVIEW=true locally to see the layout with empty slots.
 */

export type Certification = {
  id: "halal" | "fda" | "iso-9001" | "gmp" | "haccp";
  /** Accessible name of the mark, used as the logo's alt text. */
  mark: string;
  title: L;
  caption: L;
  /** Optional fixed-language line shown under the caption (e.g. the Arabic halal wording). */
  native?: { text: string; lang: string; dir?: "rtl" | "ltr" };
  logo: { src: string; width: number; height: number } | null;
  document: string | null;
};

export const certifications: Certification[] = [
  {
    id: "halal",
    mark: "Halal certification mark",
    title: { en: "Halal Certified", zh: "清真认证" },
    caption: { en: "Halal certificate", zh: "清真证书" },
    native: { text: "شهادة حلال", lang: "ar", dir: "rtl" },
    logo: null,
    document: null,
  },
  {
    id: "fda",
    mark: "FDA",
    // FDA does not approve cosmetics. Facility registration / product listing is the most a
    // manufacturer can state — and only with the registration number on file.
    title: { en: "FDA Registered", zh: "FDA 注册" },
    caption: { en: "U.S. Food & Drug Administration", zh: "美国食品药品监督管理局" },
    logo: null,
    document: null,
  },
  {
    id: "iso-9001",
    mark: "ISO 9001:2015",
    title: { en: "ISO 9001:2015 Certified", zh: "ISO 9001:2015 认证" },
    caption: { en: "Quality management system", zh: "质量管理体系" },
    logo: null,
    document: null,
  },
  {
    id: "gmp",
    mark: "GMP",
    title: { en: "GMP Certified", zh: "GMP 认证" },
    caption: { en: "Good Manufacturing Practice", zh: "良好生产规范" },
    logo: null,
    document: null,
  },
  {
    id: "haccp",
    mark: "HACCP",
    title: { en: "HACCP Certified", zh: "HACCP 认证" },
    caption: { en: "Food safety management", zh: "食品安全管理体系" },
    logo: null,
    document: null,
  },
];

export const isPublishable = (c: Certification) => Boolean(c.logo && c.document);

export const certificationsPreview = process.env.NEXT_PUBLIC_CERTIFICATIONS_PREVIEW === "true";
