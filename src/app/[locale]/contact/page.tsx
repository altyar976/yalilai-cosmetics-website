import type { Metadata } from "next";
import { ArrowUpRight, MapPin, MessageCircle, Phone } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { resolveLocale, makeT, makeHref } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { contact } from "@/content/contact";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { company, mapLinks } from "@/data/company";
import { PageHero } from "@/components/ui/PageHero";
import { RfqForm } from "@/components/inquiry/RfqForm";
import { CopyButton } from "@/components/ui/CopyButton";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: "/contact", title: contact.meta.title, description: contact.meta.description });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const t = makeT(locale);
  const href = makeHref(locale);
  return (
    <>
      <PageHero
        size="sm"
        eyebrow={t(contact.eyebrow)}
        title={t(contact.title)}
        intro={t(contact.intro)}
        crumbs={[{ label: t(ui.misc.breadcrumbHome), href: href("/") }, { label: t(ui.nav.contact) }]}
      />
      <section className="container-x grid gap-14 pb-28 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <RfqForm />
        </div>
        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="space-y-4 lg:sticky lg:top-28">
            <div className="card-surface p-7">
              <p className="display text-2xl">{t(contact.direct)}</p>
              <p className="mt-2 text-sm text-muted">{t(contact.directBody)}</p>
              <ul className="mt-6 space-y-5 text-sm">
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-champagne-deep" strokeWidth={1.5} />
                  <div>
                    <span className="block text-muted">{t(ui.contact.phone)}</span>
                    <a href={`tel:${company.phoneE164}`} className="text-lg link-underline">
                      {company.phoneDisplay}
                    </a>
                  </div>
                </li>
                <li className="flex gap-3">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-champagne-deep" strokeWidth={1.5} />
                  <div>
                    <span className="block text-muted">{t(ui.contact.wechat)}</span>
                    <span className="text-lg">{company.wechatId}</span>
                    <div className="mt-2">
                      <CopyButton value={company.wechatId} label={ui.cta.copyWechat} />
                    </div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-champagne-deep" strokeWidth={1.5} />
                  <div>
                    <span className="block text-muted">{t(ui.contact.address)}</span>
                    <span lang="zh-CN" className="mt-1 block">
                      {company.addressZh}
                    </span>
                    <span lang="en" className="mt-1 block text-muted">
                      {company.addressEn}
                    </span>
                    <span className="mt-2 block text-xs text-muted">{t(ui.contact.addressNote)}</span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <CopyButton value={company.addressZh} label={ui.cta.copyAddress} />
                      {[
                        { href: mapLinks.amap, label: "Amap 高德" },
                        { href: mapLinks.baidu, label: "Baidu 百度" },
                        { href: mapLinks.google, label: "Google Maps" },
                      ].map((m) => (
                        <a key={m.href} href={m.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-3 py-1.5 text-[0.72rem] font-medium hover:border-ink/50">
                          {m.label} <ArrowUpRight className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="rounded-[1.25rem] bg-linen p-7">
              <p className="eyebrow">{t(home.journey.eyebrow)}</p>
              <ol className="mt-5 space-y-3 text-sm">
                {home.journey.steps.slice(0, 3).map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-[family-name:var(--font-display)] text-champagne-deep">{String(i + 1).padStart(2, "0")}</span>
                    <span>{t(s.title)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
