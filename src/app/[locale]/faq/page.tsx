import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { isLocale } from "@/i18n/config";
import { resolveLocale, makeT, makeHref } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { faq } from "@/content/pages";
import { ui } from "@/content/ui";
import { company } from "@/data/company";
import { PageHero } from "@/components/ui/PageHero";
import { CtaBand } from "@/components/home/CtaBand";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: "/faq", title: faq.meta.title, description: faq.meta.description });
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const t = makeT(locale);
  const href = makeHref(locale);
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((i) => ({ "@type": "Question", name: t(i.q), acceptedAnswer: { "@type": "Answer", text: t(i.a) } })),
  };
  return (
    <>
      <PageHero eyebrow={t(faq.eyebrow)} title={t(faq.title)} intro={t(faq.intro)} crumbs={[{ label: t(ui.misc.breadcrumbHome), href: href("/") }, { label: t(ui.nav.faq) }]}>
        <p className="mt-4 text-sm">
          <a href={`tel:${company.phoneE164}`} className="link-underline">
            {company.phoneDisplay}
          </a>{" "}
          · WeChat {company.wechatId}
        </p>
      </PageHero>
      <section className="container-x pb-28">
        <div className="mx-auto max-w-4xl divide-y divide-ink/10 border-y hairline">
          {faq.items.map((item, i) => (
            <details key={i} className="group py-2" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
                <h2 className="display text-[1.5rem] leading-snug sm:text-[1.75rem]">{t(item.q)}</h2>
                <Plus className="h-5 w-5 shrink-0 transition-transform duration-500 group-open:rotate-45" strokeWidth={1.25} />
              </summary>
              <p className="max-w-3xl pb-6 leading-relaxed text-graphite">{t(item.a)}</p>
            </details>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-4xl text-sm text-muted">
          <Link href={href("/contact")} className="underline underline-offset-4">
            {t(ui.cta.quote)}
          </Link>
        </p>
      </section>
      <CtaBand locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
