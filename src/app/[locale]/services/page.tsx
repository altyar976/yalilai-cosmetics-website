import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { resolveLocale, makeT, makeHref } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { services } from "@/content/pages";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/home/CtaBand";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: "/services", title: services.meta.title, description: services.meta.description });
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const t = makeT(locale);
  const href = makeHref(locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Cosmetics OEM/ODM and private-label makeup manufacturing",
    provider: { "@type": "Organization", name: "Yalilai Cosmetics Co., Ltd." },
    areaServed: "Worldwide",
  };
  return (
    <>
      <PageHero eyebrow={t(services.eyebrow)} title={t(services.title)} intro={t(services.intro)} crumbs={[{ label: t(ui.misc.breadcrumbHome), href: href("/") }, { label: t(ui.nav.services) }]} />
      <section className="container-x pb-24">
        <Reveal className="grid gap-5 lg:grid-cols-3" stagger={0.12}>
          {services.models.map((m, i) => (
            <article key={i} data-reveal-item className={i === 1 ? "rounded-[1.5rem] bg-ink p-8 text-porcelain lg:p-10" : "card-surface p-8 lg:p-10"}>
              <p className={i === 1 ? "eyebrow !text-champagne" : "eyebrow"}>{t(m.tag)}</p>
              <h2 className="display mt-6 text-4xl">{t(m.title)}</h2>
              <p className={i === 1 ? "mt-4 text-porcelain/75" : "mt-4 text-muted"}>{t(m.body)}</p>
              <ul className="mt-8 space-y-3 text-sm">
                {m.points.map((p, k) => (
                  <li key={k} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-champagne" /> {t(p)}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </Reveal>
      </section>
      <section className="bg-linen py-24 lg:py-32">
        <div className="container-x">
          <h2 className="display text-4xl lg:text-5xl">{t(services.capabilitiesTitle)}</h2>
          <p className="mt-4 max-w-2xl text-muted">{t(services.capabilitiesNote)}</p>
          <Reveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {home.services.items.map((s, i) => (
              <div key={i} data-reveal-item className="card-surface p-7">
                <div className="flex items-start justify-between">
                  <span className="font-[family-name:var(--font-display)] text-2xl text-champagne-deep">{String(i + 1).padStart(2, "0")}</span>
                  <span className="rounded-full border border-champagne/50 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-champagne-deep">{t(s.tag)}</span>
                </div>
                <h3 className="display mt-8 text-2xl">{t(s.title)}</h3>
                <p className="mt-2 text-sm text-muted">{t(s.body)}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
      <section className="container-x grid gap-12 py-24 lg:grid-cols-12 lg:py-32">
        <div className="lg:col-span-5">
          <h2 className="display text-4xl lg:text-5xl">{t(services.briefTitle)}</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={href("/contact")} className="btn btn-primary">
              {t(ui.cta.quote)}
            </Link>
            <Link href={href("/how-it-works")} className="btn btn-ghost">
              {t(ui.nav.howItWorks)} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <Reveal className="lg:col-span-6 lg:col-start-7" stagger={0.08}>
          <ol className="divide-y divide-ink/10 border-y hairline">
            {services.brief.map((b, i) => (
              <li key={i} data-reveal-item className="flex gap-5 py-5">
                <span className="font-[family-name:var(--font-display)] text-xl text-champagne-deep">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-lg">{t(b)}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>
      <CtaBand locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
