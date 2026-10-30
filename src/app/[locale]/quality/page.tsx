import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { resolveLocale, makeT, makeHref } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { quality } from "@/content/pages";
import { ui } from "@/content/ui";
import { factoryPhotoById } from "@/data/factory-photos";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/home/CtaBand";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: "/quality", title: quality.meta.title, description: quality.meta.description });
}

export default async function QualityPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const t = makeT(locale);
  const href = makeHref(locale);
  const photo = factoryPhotoById.get("hand-finishing")!;
  return (
    <>
      <PageHero eyebrow={t(quality.eyebrow)} title={t(quality.title)} intro={t(quality.intro)} crumbs={[{ label: t(ui.misc.breadcrumbHome), href: href("/") }, { label: t(ui.nav.quality) }]} />
      <section className="container-x grid gap-12 pb-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] lg:sticky lg:top-28">
            <Image src={photo.src} alt={t(photo.alt)} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" placeholder={photo.blur ? "blur" : "empty"} blurDataURL={photo.blur} />
            <p className="absolute bottom-4 left-4 right-4 rounded-2xl bg-porcelain/85 p-3 text-xs backdrop-blur">
              <span className="block text-[0.62rem] uppercase tracking-[0.18em] text-champagne-deep">{t(ui.misc.realPhoto)}</span>
              {t(photo.caption)}
            </p>
          </div>
        </div>
        <Reveal className="lg:col-span-6 lg:col-start-7" stagger={0.1}>
          <ol className="relative space-y-10 border-l border-champagne/60 pl-8">
            {quality.stages.map((s, i) => (
              <li key={i} data-reveal-item className="relative">
                <span className="absolute -left-[2.45rem] top-2 h-3 w-3 rounded-full border border-champagne bg-ivory" aria-hidden="true" />
                <p className="font-[family-name:var(--font-display)] text-xl text-champagne-deep">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="display mt-1 text-3xl">{t(s.title)}</h2>
                <p className="mt-3 leading-relaxed text-graphite">{t(s.body)}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>
      <section className="bg-ink py-24 text-porcelain lg:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <h2 className="display text-4xl lg:col-span-5 lg:text-5xl">{t(quality.askTitle)}</h2>
          <Reveal className="lg:col-span-6 lg:col-start-7" stagger={0.08}>
            <ul className="divide-y divide-porcelain/10 border-y border-porcelain/10">
              {quality.ask.map((q, i) => (
                <li key={i} data-reveal-item className="flex gap-5 py-5 text-lg text-porcelain/90">
                  <span className="font-[family-name:var(--font-display)] text-champagne">{String(i + 1).padStart(2, "0")}</span>
                  {t(q)}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
      <section className="container-x py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-champagne-deep" strokeWidth={1.25} />
          <h2 className="display mt-6 text-4xl">{t(quality.claimsTitle)}</h2>
          <p className="lede mt-6">{t(quality.claims)}</p>
        </div>
      </section>
      <CtaBand locale={locale} />
    </>
  );
}
