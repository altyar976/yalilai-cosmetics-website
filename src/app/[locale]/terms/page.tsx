import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { resolveLocale, makeT, makeHref } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { legal } from "@/content/pages";
import { ui } from "@/content/ui";
import { PageHero } from "@/components/ui/PageHero";

const doc = legal.terms;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: "/terms", title: doc.meta.title, description: doc.meta.description, noindex: true });
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const t = makeT(locale);
  const href = makeHref(locale);
  return (
    <>
      <PageHero align="left" eyebrow={t(ui.nav.company)} title={t(doc.meta.title)} crumbs={[{ label: t(ui.misc.breadcrumbHome), href: href("/") }, { label: t(doc.meta.title) }]} />
      <section className="container-x pb-28">
        <div className="max-w-3xl">
          <p className="rounded-2xl border border-champagne/60 bg-blush/40 p-5 text-sm">{t(doc.notice)}</p>
          {doc.sections.map((s, i) => (
            <div key={i} className="mt-12">
              <h2 className="display text-3xl">{t(s.title)}</h2>
              <p className="mt-4 leading-relaxed text-graphite">{t(s.body)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
