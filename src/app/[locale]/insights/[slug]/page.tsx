import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";
import { resolveLocale, makeT, makeHref } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { articleBySlug, articles, insightsPage } from "@/content/insights";
import { ui } from "@/content/ui";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductImage } from "@/components/ui/ProductImage";
import { CtaBand } from "@/components/home/CtaBand";

export function generateStaticParams() {
  return locales.flatMap((locale) => articles.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = articleBySlug.get(slug);
  if (!isLocale(locale) || !a) return {};
  return buildMetadata({ locale, path: `/insights/${a.slug}`, title: a.title, description: a.dek, image: a.cover });
}

export default async function ArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const locale = await resolveLocale(params.then((p) => ({ locale: p.locale })));
  const { slug } = await params;
  const a = articleBySlug.get(slug);
  if (!a) notFound();
  const t = makeT(locale);
  const href = makeHref(locale);
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: t(a.title), description: t(a.dek), inLanguage: locale === "zh-cn" ? "zh-CN" : "en" };
  const others = articles.filter((x) => x.slug !== a.slug);
  return (
    <>
      <article className="container-x pb-24 pt-28 lg:pt-36">
        <Breadcrumbs className="mb-10" items={[{ label: t(ui.misc.breadcrumbHome), href: href("/") }, { label: t(ui.nav.insights), href: href("/insights") }, { label: t(a.title) }]} />
        <header className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">
            {t(a.kind)} · {a.minutes} {t(insightsPage.minutes)}
          </p>
          <h1 className="display mt-5 text-[clamp(2.4rem,5vw,4.4rem)] text-balance">{t(a.title)}</h1>
          <p className="lede mx-auto mt-6 max-w-2xl">{t(a.dek)}</p>
        </header>
        <div className="relative mx-auto mt-14 aspect-[16/9] max-w-5xl overflow-hidden rounded-[1.75rem] bg-render">
          <ProductImage src={a.cover} alt={t(ui.misc.illustrative)} sizes="(min-width:1024px) 1000px, 100vw" priority className="object-[50%_60%]" />
        </div>
        <div className="mx-auto mt-16 max-w-2xl">
          {a.sections.map((s, i) => (
            <section key={i} className="mt-12 first:mt-0">
              <h2 className="display text-3xl">{t(s.heading)}</h2>
              {s.paragraphs.map((p, k) => (
                <p key={k} className="mt-4 text-[1.06rem] leading-[1.85] text-graphite">
                  {t(p)}
                </p>
              ))}
              {s.list && (
                <ul className="mt-5 space-y-2">
                  {s.list.map((li, k) => (
                    <li key={k} className="flex gap-3 text-[1.02rem] text-graphite">
                      <span className="text-champagne-deep">—</span>
                      {t(li)}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <div className="mt-16 border-t hairline pt-10">
            <p className="text-sm text-muted">{t(ui.nav.insights)}</p>
            <ul className="mt-4 space-y-3">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={href(`/insights/${o.slug}`)} className="display text-2xl link-underline">
                    {t(o.title)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
      <CtaBand locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
