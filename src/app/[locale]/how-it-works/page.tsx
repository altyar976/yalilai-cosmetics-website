import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { resolveLocale, makeT, makeHref } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { process } from "@/content/pages";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/home/CtaBand";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: "/how-it-works", title: process.meta.title, description: process.meta.description });
}

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const t = makeT(locale);
  const href = makeHref(locale);
  return (
    <>
      <PageHero eyebrow={t(process.eyebrow)} title={t(process.title)} intro={t(process.intro)} crumbs={[{ label: t(ui.misc.breadcrumbHome), href: href("/") }, { label: t(ui.nav.howItWorks) }]} />
      <section className="container-x pb-24">
        <ol className="grid gap-px overflow-hidden rounded-[1.5rem] border hairline bg-ink/10 md:grid-cols-2 lg:grid-cols-3">
          {home.journey.steps.map((s, i) => (
            <Reveal as="li" key={i} className="flex min-h-[320px] flex-col bg-porcelain p-8 lg:p-10">
              <span className="font-[family-name:var(--font-display)] text-5xl text-champagne-deep/80">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="display mt-auto pt-10 text-3xl">{t(s.title)}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{t(s.body)}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {process.deliverables[i].map((d, k) => (
                  <li key={k} className="rounded-full bg-linen px-3 py-1 text-xs">
                    {t(d)}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ol>
        <p className="mt-6 text-sm text-muted">{t(home.journey.note)}</p>
      </section>
      <section className="bg-linen py-24 lg:py-32">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {[
            { title: process.youTitle, items: process.you },
            { title: process.usTitle, items: process.us },
          ].map((b, i) => (
            <div key={i} className="card-surface p-8 lg:p-10">
              <h2 className="display text-3xl">{t(b.title)}</h2>
              <ul className="mt-6 space-y-3">
                {b.items.map((it, k) => (
                  <li key={k} className="flex gap-3 border-b hairline pb-3">
                    <span className="text-champagne-deep">—</span>
                    {t(it)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <CtaBand locale={locale} />
    </>
  );
}
