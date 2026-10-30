import Link from "next/link";
import { ArrowUpRight, MapPin, Phone, MessageCircle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { makeHref, makeT } from "@/i18n/server";
import { ui } from "@/content/ui";
import { categories, categoryIds, collectionIds, collections } from "@/data/taxonomy";
import { company, mapLinks } from "@/data/company";
import { CopyButton } from "@/components/ui/CopyButton";
import { LanguageSwitch } from "./LanguageSwitch";
import { Wordmark } from "./Header";

export function Footer({ locale }: { locale: Locale }) {
  const t = makeT(locale);
  const href = makeHref(locale);
  const year = new Date().getFullYear();
  const companyLinks = [
    { p: "/about", l: ui.nav.about },
    { p: "/services", l: ui.nav.services },
    { p: "/customization-studio", l: ui.nav.studio },
    { p: "/factory", l: ui.nav.factory },
    { p: "/quality", l: ui.nav.quality },
    { p: "/how-it-works", l: ui.nav.howItWorks },
    { p: "/faq", l: ui.nav.faq },
    { p: "/insights", l: ui.nav.insights },
    { p: "/contact", l: ui.nav.contact },
  ];
  return (
    <footer data-site-footer className="relative overflow-hidden bg-ink text-porcelain">
      <div className="container-x pb-10 pt-20 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Wordmark tone="light" />
            <p className="mt-8 max-w-sm font-[family-name:var(--font-display)] text-2xl leading-snug text-porcelain/90">
              {locale === "zh-cn" ? "为您的品牌而造，让产品脱颖而出。" : "Crafted for your brand. Made to stand out."}
            </p>
            <p className="mt-6 text-sm text-porcelain/60">
              {company.nameEn}
              <br />
              {company.nameZh}
            </p>
            <div className="mt-8">
              <LanguageSwitch tone="light" />
            </div>
          </div>

          <nav aria-label={t(ui.nav.products)} className="lg:col-span-2">
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-porcelain/50">{t(ui.nav.products)}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {collectionIds.map((c) => (
                <li key={c}>
                  <Link href={href(`/products/${c}`)} className="link-underline font-medium text-porcelain hover:text-porcelain">
                    {t(collections[c].name)}
                  </Link>
                </li>
              ))}
              {categoryIds.map((c) => (
                <li key={c}>
                  <Link href={href(`/products/${c}`)} className="link-underline text-porcelain/80 hover:text-porcelain">
                    {t(categories[c].name)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t(ui.nav.company)} className="lg:col-span-2">
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-porcelain/50">{t(ui.nav.company)}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {companyLinks.map((n) => (
                <li key={n.p}>
                  <Link href={href(n.p)} className="link-underline text-porcelain/80 hover:text-porcelain">
                    {t(n.l)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <address className="not-italic lg:col-span-4">
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-porcelain/50">{t(ui.nav.contact)}</p>
            <ul className="mt-6 space-y-6 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-champagne" strokeWidth={1.5} />
                <div>
                  <span className="block text-porcelain/50">{t(ui.contact.phone)}</span>
                  <a href={`tel:${company.phoneE164}`} className="link-underline text-base">
                    {company.phoneDisplay}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-champagne" strokeWidth={1.5} />
                <div className="flex flex-wrap items-center gap-3">
                  <span>
                    <span className="block text-porcelain/50">{t(ui.contact.wechat)}</span>
                    <span className="text-base">{company.wechatId}</span>
                  </span>
                  <CopyButton value={company.wechatId} label={ui.cta.copyWechat} tone="light" />
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-champagne" strokeWidth={1.5} />
                <div>
                  <span className="block text-porcelain/50">{t(ui.contact.address)}</span>
                  <span lang="zh-CN" className="mt-1 block text-porcelain/90">
                    {company.addressZh}
                  </span>
                  <span lang="en" className="mt-1 block text-porcelain/60">
                    {company.addressEn}
                  </span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CopyButton value={company.addressZh} label={ui.cta.copyAddress} tone="light" />
                    <a href={locale === "zh-cn" ? mapLinks.amap : mapLinks.google} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-porcelain/25 px-3 py-1.5 text-[0.72rem] font-medium tracking-[0.06em] hover:border-porcelain/60">
                      {t(ui.cta.directions)} <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </address>
        </div>

        <div className="mt-20 select-none font-[family-name:var(--font-bodoni)] text-[19vw] leading-[0.8] tracking-[0.06em] text-porcelain/[0.05]" aria-hidden="true">
          YALILAI
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-porcelain/10 pt-6 text-xs text-porcelain/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {locale === "zh-cn" ? company.nameZh : company.nameEn}
          </p>
          <p className="max-w-xl md:text-center">{t(ui.reference.siteNote)}</p>
          <div className="flex gap-5">
            <Link href={href("/privacy")} className="link-underline hover:text-porcelain">
              {t(ui.nav.privacy)}
            </Link>
            <Link href={href("/terms")} className="link-underline hover:text-porcelain">
              {t(ui.nav.terms)}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
