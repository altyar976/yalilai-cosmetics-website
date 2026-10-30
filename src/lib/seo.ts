import type { Metadata } from "next";
import { locales, localeMeta, type Locale } from "@/i18n/config";
import { company, siteUrl } from "@/data/company";
import type { L } from "@/data/taxonomy";

type MetaInput = {
  locale: Locale;
  /** Path without the locale prefix, e.g. "/products/mascara". */
  path: string;
  title: L;
  description: L;
  image?: string;
  noindex?: boolean;
};

export function buildMetadata({ locale, path, title, description, image, noindex }: MetaInput): Metadata {
  const tr = (l: L) => (locale === "zh-cn" ? l.zh : l.en);
  const clean = path === "/" ? "" : path;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[localeMeta[l].hreflang] = `${siteUrl}/${l}${clean}`;
  languages["x-default"] = `${siteUrl}/en${clean}`;
  const og = image ?? "/images/og/yalilai-og.jpg";
  const siteName = locale === "zh-cn" ? `${company.nameZh} · YALILAI` : `YALILAI · ${company.nameEn}`;
  return {
    title: tr(title),
    description: tr(description),
    alternates: { canonical: `${siteUrl}/${locale}${clean}`, languages },
    openGraph: {
      type: "website",
      siteName,
      title: tr(title),
      description: tr(description),
      url: `${siteUrl}/${locale}${clean}`,
      locale: localeMeta[locale].ogLocale,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeMeta[l].ogLocale),
      images: [image ? { url: og } : { url: og, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: tr(title), description: tr(description), images: [og] },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

/** Organization structured data limited to verified facts only. */
export function organizationJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.nameEn,
    alternateName: [company.nameZh, company.wordmark],
    url: `${siteUrl}/${locale}`,
    telephone: company.phoneE164,
    address: {
      "@type": "PostalAddress",
      streetAddress: locale === "zh-cn" ? "北鹿西街676号，4号楼2-3号电梯2楼" : "2nd Floor, Elevators 2–3, Building 4, No. 676 Beilu West Street",
      addressLocality: locale === "zh-cn" ? "东阳市" : "Dongyang",
      addressRegion: locale === "zh-cn" ? "浙江省金华市" : "Jinhua, Zhejiang",
      addressCountry: "CN",
    },
    ...(company.email ? { email: company.email } : {}),
  };
}
