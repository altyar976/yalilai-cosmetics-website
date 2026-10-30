import type { Metadata, Viewport } from "next";
import "../globals.css";
import { bodoni, jost, notoSerifSC } from "@/lib/fonts";
import { locales, localeMeta } from "@/i18n/config";
import { resolveLocale } from "@/i18n/server";
import { LocaleProvider } from "@/i18n/locale-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { CursorFollower } from "@/components/motion/CursorFollower";
import { InquiryToast } from "@/components/inquiry/InquiryToast";
import { organizationJsonLd } from "@/lib/seo";
import { siteUrl } from "@/data/company";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "YALILAI · Yalilai Cosmetics Co., Ltd.", template: "%s · YALILAI" },
  applicationName: "YALILAI",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f8f6f2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  return (
    <html lang={localeMeta[locale].htmlLang} className={`${bodoni.variable} ${jost.variable} ${notoSerifSC.variable}`} suppressHydrationWarning>
      <body>
        <LocaleProvider locale={locale}>
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer locale={locale} />
          <InquiryToast />
          <MotionProvider />
          <CursorFollower />
        </LocaleProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(locale)) }} />
      </body>
    </html>
  );
}
