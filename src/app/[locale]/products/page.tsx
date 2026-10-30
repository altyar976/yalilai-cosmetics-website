import { Suspense } from "react";
import type { Metadata } from "next";
import { resolveLocale, makeT, makeHref } from "@/i18n/server";
import { isLocale } from "@/i18n/config";
import { buildMetadata } from "@/lib/seo";
import { ui } from "@/content/ui";
import { PageHero } from "@/components/ui/PageHero";
import { CatalogView } from "@/components/catalog/CatalogView";
import { CategoryStrip } from "@/components/catalog/CategoryStrip";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: "/products",
    title: { en: "OEM/ODM Eyebrow, Eyeliner & Lip Pen Catalogue — 139 Reference Models", zh: "OEM/ODM 眉笔、眼线笔与唇部笔目录——139 款参考型号" },
    description: ui.catalog.intro,
  });
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const t = makeT(locale);
  const href = makeHref(locale);
  return (
    <>
      <PageHero
        size="sm"
        eyebrow={t(ui.catalog.eyebrow)}
        title={t(ui.catalog.title)}
        intro={t(ui.catalog.intro)}
        crumbs={[{ label: t(ui.misc.breadcrumbHome), href: href("/") }, { label: t(ui.catalog.title) }]}
      >
        <p className="mt-5 max-w-2xl text-xs text-muted">{t(ui.reference.disclaimer)}</p>
      </PageHero>
      <CategoryStrip />
      <Suspense>
        <CatalogView />
      </Suspense>
    </>
  );
}
