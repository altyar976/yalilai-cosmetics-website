import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { resolveLocale, makeT, makeHref } from "@/i18n/server";
import { isLocale, locales } from "@/i18n/config";
import { buildMetadata } from "@/lib/seo";
import { ui } from "@/content/ui";
import { categories, categoryIds, collectionIds, collections, type CategoryId, type CollectionId } from "@/data/taxonomy";
import { categoryCover, collectionCover, productsInCategory, productsInCollection } from "@/data/products";
import { PageHero } from "@/components/ui/PageHero";
import { CatalogView } from "@/components/catalog/CatalogView";
import { CategoryStrip } from "@/components/catalog/CategoryStrip";

const isCategory = (c: string): c is CategoryId => (categoryIds as readonly string[]).includes(c);
const isCollection = (c: string): c is CollectionId => (collectionIds as readonly string[]).includes(c);

export function generateStaticParams() {
  return locales.flatMap((locale) => [...collectionIds, ...categoryIds].map((category) => ({ locale, category })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isLocale(locale)) return {};
  if (isCollection(category)) {
    const c = collections[category];
    const n = productsInCollection(category).length;
    return buildMetadata({
      locale,
      path: `/products/${category}`,
      title: { en: `${c.name.en} — ${n} OEM/ODM Reference Models`, zh: `${c.name.zh}——${n} 款 OEM/ODM 参考型号` },
      description: c.intro,
      image: collectionCover(category)?.image,
    });
  }
  if (!isCategory(category)) return {};
  const c = categories[category];
  return buildMetadata({
    locale,
    path: `/products/${category}`,
    title: { en: `${c.name.en} for Private Label — OEM/ODM Models`, zh: `${c.name.zh}——自有品牌 OEM/ODM 型号` },
    description: c.intro,
    image: categoryCover(category)?.image,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const locale = await resolveLocale(params.then((p) => ({ locale: p.locale })));
  const { category } = await params;
  const t = makeT(locale);
  const href = makeHref(locale);
  const crumbsBase = [
    { label: t(ui.misc.breadcrumbHome), href: href("/") },
    { label: t(ui.catalog.title), href: href("/products") },
  ];

  if (isCollection(category)) {
    const c = collections[category];
    return (
      <>
        <PageHero size="sm" eyebrow={t(ui.catalog.collections)} title={t(c.name)} intro={t(c.intro)} crumbs={[...crumbsBase, { label: t(c.name) }]} />
        <section className="container-x mb-14" aria-label={t(ui.catalog.category)}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.categories.map((id) => {
              const cover = categoryCover(id);
              return (
                <li key={id}>
                  <Link href={href(`/products/${id}`)} className="group flex items-center gap-5 rounded-[1.4rem] bg-white p-3 pr-5 ring-1 ring-ink/[0.06] transition-shadow duration-500 hover:shadow-[0_24px_50px_-30px_rgba(23,21,19,0.35)]">
                    <span className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl">
                      {cover && <Image src={cover.image} alt="" fill sizes="96px" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{t(categories[id].name)}</span>
                      <span className="mt-1 block text-sm text-muted">
                        {productsInCategory(id).length} {t(ui.catalog.results)}
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition group-hover:text-ink" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
        <CategoryStrip />
        <Suspense>
          <CatalogView scope={c.categories} />
        </Suspense>
      </>
    );
  }

  if (!isCategory(category)) notFound();
  const c = categories[category];
  return (
    <>
      <PageHero size="sm" eyebrow={t(ui.catalog.eyebrow)} title={t(c.name)} intro={t(c.intro)} crumbs={[...crumbsBase, { label: t(c.name) }]} />
      <CategoryStrip />
      <Suspense>
        <CatalogView scope={[category]} />
      </Suspense>
    </>
  );
}
