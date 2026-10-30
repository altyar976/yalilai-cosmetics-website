import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { resolveLocale, makeT, makeHref } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { articles, insightsPage } from "@/content/insights";
import { ui } from "@/content/ui";
import { PageHero } from "@/components/ui/PageHero";
import { ProductImage } from "@/components/ui/ProductImage";
import { Reveal } from "@/components/motion/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: "/insights", title: insightsPage.meta.title, description: insightsPage.meta.description });
}

export default async function InsightsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const t = makeT(locale);
  const href = makeHref(locale);
  return (
    <>
      <PageHero eyebrow={t(insightsPage.eyebrow)} title={t(insightsPage.title)} intro={t(insightsPage.intro)} crumbs={[{ label: t(ui.misc.breadcrumbHome), href: href("/") }, { label: t(ui.nav.insights) }]} />
      <section className="container-x pb-28">
        <Reveal className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {articles.map((a) => (
            <article key={a.slug} data-reveal-item className="group">
              <Link href={href(`/insights/${a.slug}`)} className="block">
                <span className="relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-render">
                  <ProductImage src={a.cover} alt="" sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="transition-transform duration-[1.2s] ease-[var(--ease-luxe)] group-hover:scale-105" />
                </span>
                <p className="mt-5 text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                  {t(a.kind)} · {a.minutes} {t(insightsPage.minutes)}
                </p>
                <h2 className="display mt-2 text-3xl leading-tight">{t(a.title)}</h2>
                <p className="mt-3 text-muted">{t(a.dek)}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium link-underline">
                  {t(ui.cta.readMore)} <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            </article>
          ))}
        </Reveal>
        <p className="mt-16 text-xs text-muted">{t(insightsPage.editable)}</p>
      </section>
    </>
  );
}
