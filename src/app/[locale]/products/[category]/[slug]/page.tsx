import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { resolveLocale, makeT, makeHref } from "@/i18n/server";
import { isLocale, locales } from "@/i18n/config";
import { buildMetadata } from "@/lib/seo";
import { ui } from "@/content/ui";
import { categories, features, productTypes, tips } from "@/data/taxonomy";
import { productBySlug, productPath, products, relatedProducts } from "@/data/products";
import { siteUrl } from "@/data/company";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductDetail } from "@/components/catalog/ProductDetail";
import { RelatedGrid } from "@/components/catalog/RelatedGrid";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/home/CtaBand";

export function generateStaticParams() {
  return locales.flatMap((locale) => products.map((p) => ({ locale, category: p.category, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug, category } = await params;
  const p = productBySlug.get(slug);
  if (!isLocale(locale) || !p || p.category !== category) return {};
  const c = categories[p.category];
  return buildMetadata({
    locale,
    path: productPath(p),
    title: { en: `${p.model} ${p.name.en} — OEM/ODM ${c.short.en}`, zh: `${p.model} ${p.name.zh}——OEM/ODM ${c.short.zh}` },
    description: {
      en: `${p.name.en} (model ${p.model}), ${p.size}${p.capacity ? `, ${p.capacity.en}` : ""}. Request logo printing, colours and packaging for your private-label range.`,
      zh: `${p.name.zh}（型号 ${p.model}），尺寸 ${p.size}${p.capacity ? `，容量 ${p.capacity.zh}` : ""}。可就 Logo 印刷、颜色与包装提出自有品牌定制需求。`,
    },
    image: p.image,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }) {
  const locale = await resolveLocale(params.then((x) => ({ locale: x.locale })));
  const { category, slug } = await params;
  const p = productBySlug.get(slug);
  if (!p || p.category !== category) notFound();
  const t = makeT(locale);
  const href = makeHref(locale);
  const c = categories[p.category];

  const specs: { k: string; v: string }[] = [
    { k: t(ui.catalog.model), v: p.model },
    { k: t(ui.catalog.category), v: t(c.name) },
    { k: t(ui.catalog.type), v: t(productTypes[p.type]) },
    { k: t(ui.catalog.tips), v: p.tips.map((x) => t(tips[x])).join(" · ") },
    ...(p.features.length ? [{ k: t(ui.catalog.features), v: p.features.map((x) => t(features[x])).join(" · ") }] : []),
    { k: t(ui.catalog.dimensions), v: p.size },
    ...(p.capacity ? [{ k: t(ui.catalog.capacity), v: t(p.capacity) }] : []),
    ...(p.weight ? [{ k: t(ui.catalog.weight), v: p.weight }] : []),
    { k: t(ui.catalog.moq), v: t(ui.catalog.onRequest) },
    { k: t(ui.catalog.leadTime), v: t(ui.catalog.onRequest) },
    { k: t(ui.catalog.price), v: t(ui.catalog.onRequest) },
  ];

  // Product structured data: identification only — no brand, offer, rating or claim is asserted.
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: t(p.name),
    sku: p.model,
    mpn: p.model,
    category: t(c.name),
    description: t(p.description),
    image: `${siteUrl}${p.image}`,
    url: `${siteUrl}/${locale}${productPath(p)}`,
  };

  return (
    <>
      <section className="container-x pb-20 pt-28 lg:pt-36">
        <Breadcrumbs
          className="mb-8"
          items={[
            { label: t(ui.misc.breadcrumbHome), href: href("/") },
            { label: t(ui.catalog.title), href: href("/products") },
            { label: t(c.name), href: href(`/products/${p.category}`) },
            { label: p.model },
          ]}
        />
        <div className="mb-10 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow">{t(c.name)}</p>
            <p className="mt-5 font-mono text-sm tracking-[0.1em] text-champagne-deep">
              {t(ui.catalog.model)} {p.model}
            </p>
            <h1 className="display mt-2 text-[clamp(2.3rem,4.6vw,4.2rem)] text-balance">{t(p.name)}</h1>
          </div>
          <div className="lg:col-span-5 lg:pt-12">
            <p className="leading-relaxed text-graphite">{t(p.description)}</p>
          </div>
        </div>

        <ProductDetail product={p} />

        <div className="mt-20 grid gap-12 border-t hairline pt-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <h2 className="display text-3xl">{t(ui.catalog.specs)}</h2>
            <dl className="mt-8 divide-y divide-ink/10 border-y hairline">
              {specs.map((s) => (
                <div key={s.k} className="grid grid-cols-3 gap-4 py-4 text-sm">
                  <dt className="text-muted">{s.k}</dt>
                  <dd className="col-span-2">{s.v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-muted">{t(ui.reference.specsNote)}</p>
          </Reveal>
          <Reveal className="lg:col-span-4 lg:col-start-9">
            <h2 className="display text-3xl">{t(ui.catalog.nextSteps)}</h2>
            <ol className="mt-8 space-y-4 text-sm">
              {[ui.catalog.step1, ui.catalog.step2, ui.catalog.step3].map((l, i) => (
                <li key={i} className="flex gap-4 border-b hairline pb-4">
                  <span className="font-[family-name:var(--font-display)] text-lg text-champagne-deep">{String(i + 1).padStart(2, "0")}</span>
                  <span className="pt-1">{t(l)}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href={href("/contact")} className="btn btn-primary btn-sm">
                {t(ui.cta.quote)}
              </Link>
              <Link href={href("/how-it-works")} className="inline-flex items-center gap-2 text-sm font-medium link-underline">
                {t(ui.nav.howItWorks)} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-linen py-20 lg:py-28">
        <div className="container-x">
          <h2 className="display text-4xl">{t(ui.catalog.related)}</h2>
          <RelatedGrid slugs={relatedProducts(p, 4).map((r) => r.slug)} />
        </div>
      </section>
      <CtaBand locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
