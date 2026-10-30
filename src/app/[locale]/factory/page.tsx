import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { resolveLocale, makeT, makeHref } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { factoryPage } from "@/content/pages";
import { ui } from "@/content/ui";
import { company, mapLinks } from "@/data/company";
import { factoryPhotoById } from "@/data/factory-photos";
import { PageHero } from "@/components/ui/PageHero";
import { FactoryTour } from "@/components/factory/FactoryTour";
import { Parallax } from "@/components/motion/Parallax";
import { CtaBand } from "@/components/home/CtaBand";
import { CopyButton } from "@/components/ui/CopyButton";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: "/factory", title: factoryPage.meta.title, description: factoryPage.meta.description, image: "/images/factory/production-workshop-wide.jpg" });
}

export default async function FactoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const t = makeT(locale);
  const href = makeHref(locale);
  const wide = factoryPhotoById.get("workshop-wide")!;
  return (
    <>
      <PageHero eyebrow={t(factoryPage.eyebrow)} title={t(factoryPage.title)} intro={t(factoryPage.intro)} crumbs={[{ label: t(ui.misc.breadcrumbHome), href: href("/") }, { label: t(ui.nav.factory) }]} />
      <section className="container-x">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] bg-graphite">
          <Parallax speed={16} className="absolute -inset-y-[9%] inset-x-0">
            <Image src={wide.src} alt={t(wide.alt)} fill loading="eager" fetchPriority="high" sizes="100vw" className="object-cover" placeholder={wide.blur ? "blur" : "empty"} blurDataURL={wide.blur} />
          </Parallax>
          <p className="absolute bottom-4 left-4 rounded-full bg-porcelain/85 px-3 py-1.5 text-xs backdrop-blur">
            {t(ui.misc.realPhoto)} · {t(wide.title)}
          </p>
        </div>
      </section>
      <div className="pt-10">
        <FactoryTour />
      </div>
      <section className="container-x grid gap-12 py-24 lg:grid-cols-2 lg:py-32">
        <div>
          <h2 className="display text-4xl">{t(factoryPage.provenanceTitle)}</h2>
          <ul className="mt-8 space-y-4">
            {factoryPage.provenance.map((p, i) => (
              <li key={i} className="flex gap-4 border-b hairline pb-4 text-graphite">
                <span className="font-[family-name:var(--font-display)] text-champagne-deep">{String(i + 1).padStart(2, "0")}</span>
                {t(p)}
              </li>
            ))}
          </ul>
        </div>
        <div className="card-surface p-8 lg:p-10">
          <h2 className="display text-4xl">{t(factoryPage.visitTitle)}</h2>
          <p className="mt-3 text-muted">{t(factoryPage.visitBody)}</p>
          <p lang="zh-CN" className="mt-8 text-lg">
            {company.addressZh}
          </p>
          <p lang="en" className="mt-2 text-sm text-muted">
            {company.addressEn}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <CopyButton value={company.addressZh} label={ui.cta.copyAddress} />
            {[
              { h: mapLinks.amap, l: "Amap 高德" },
              { h: mapLinks.baidu, l: "Baidu 百度" },
              { h: mapLinks.google, l: "Google Maps" },
            ].map((m) => (
              <a key={m.h} href={m.h} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-3 py-1.5 text-[0.72rem] font-medium hover:border-ink/50">
                {m.l} <ArrowUpRight className="h-3 w-3" />
              </a>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`tel:${company.phoneE164}`} className="btn btn-primary">
              {t(ui.cta.call)} {company.phoneDisplay}
            </a>
            <Link href={href("/contact")} className="btn btn-ghost">
              {t(ui.cta.quote)}
            </Link>
          </div>
        </div>
      </section>
      <CtaBand locale={locale} />
    </>
  );
}
