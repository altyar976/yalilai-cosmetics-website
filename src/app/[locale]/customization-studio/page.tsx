import { Suspense } from "react";
import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { resolveLocale, makeT, makeHref } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { studio } from "@/content/studio";
import { ui } from "@/content/ui";
import { PageHero } from "@/components/ui/PageHero";
import { StudioApp } from "@/components/studio/StudioApp";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: "/customization-studio", title: studio.meta.title, description: studio.meta.description });
}

export default async function StudioPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const t = makeT(locale);
  const href = makeHref(locale);
  return (
    <>
      <PageHero
        size="sm"
        eyebrow={t(studio.eyebrow)}
        title={t(studio.title)}
        intro={t(studio.intro)}
        crumbs={[{ label: t(ui.misc.breadcrumbHome), href: href("/") }, { label: t(ui.nav.studio) }]}
      />
      <Suspense>
        <StudioApp />
      </Suspense>
    </>
  );
}
