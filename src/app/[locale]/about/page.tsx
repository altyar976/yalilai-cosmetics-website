import type { Metadata } from "next";
import Image from "next/image";
import { isLocale } from "@/i18n/config";
import { resolveLocale, makeT, makeHref } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { about } from "@/content/pages";
import { ui } from "@/content/ui";
import { company } from "@/data/company";
import { factoryPhotoById } from "@/data/factory-photos";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { CtaBand } from "@/components/home/CtaBand";
import { CopyButton } from "@/components/ui/CopyButton";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: "/about", title: about.meta.title, description: about.meta.description, image: "/images/factory/reception-wall-yalilai-cosmetics.jpg" });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const t = makeT(locale);
  const href = makeHref(locale);
  const reception = factoryPhotoById.get("reception")!;
  const meeting = factoryPhotoById.get("meeting-room")!;
  return (
    <>
      <PageHero eyebrow={t(about.eyebrow)} title={t(about.title)} intro={t(about.intro)} crumbs={[{ label: t(ui.misc.breadcrumbHome), href: href("/") }, { label: t(ui.nav.about) }]} />
      <section className="container-x">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem]">
          <Parallax speed={14} className="absolute -inset-y-[8%] inset-x-0">
            <Image src={reception.src} alt={t(reception.alt)} fill loading="eager" fetchPriority="high" sizes="100vw" className="object-cover" placeholder={reception.blur ? "blur" : "empty"} blurDataURL={reception.blur} />
          </Parallax>
          <p className="absolute bottom-4 left-4 rounded-full bg-porcelain/85 px-3 py-1.5 text-xs backdrop-blur">
            {t(ui.misc.realPhoto)} · {t(reception.title)}
          </p>
        </div>
      </section>
      <section className="container-x grid gap-12 py-24 lg:grid-cols-12 lg:py-32">
        <Reveal className="lg:col-span-4">
          <h2 className="display text-4xl lg:text-5xl">{t(about.storyTitle)}</h2>
        </Reveal>
        <Reveal className="space-y-6 lg:col-span-7 lg:col-start-6" stagger={0.1}>
          {about.story.map((p, i) => (
            <p key={i} data-reveal-item className={i === 0 ? "lede" : "leading-relaxed text-graphite"}>
              {t(p)}
            </p>
          ))}
        </Reveal>
      </section>
      <section className="bg-linen py-24 lg:py-32">
        <div className="container-x">
          <h2 className="display text-4xl lg:text-5xl">{t(about.valuesTitle)}</h2>
          <Reveal className="mt-12 grid gap-5 md:grid-cols-3" stagger={0.1}>
            {about.values.map((v, i) => (
              <div key={i} data-reveal-item className="card-surface p-8">
                <p className="font-[family-name:var(--font-display)] text-3xl text-champagne-deep">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="display mt-8 text-3xl">{t(v.title)}</h3>
                <p className="mt-3 text-muted">{t(v.body)}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
      <section className="container-x grid gap-12 py-24 lg:grid-cols-12 lg:py-32">
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
            <Image src={meeting.src} alt={t(meeting.alt)} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" placeholder={meeting.blur ? "blur" : "empty"} blurDataURL={meeting.blur} />
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <h2 className="display text-4xl">{t(about.factsTitle)}</h2>
          <p className="mt-3 text-sm text-muted">{t(about.factsNote)}</p>
          <dl className="mt-8 divide-y divide-ink/10 border-y hairline text-sm">
            {[
              [t(about.facts.nameEn), company.nameEn],
              [t(about.facts.nameZh), company.nameZh],
              [t(about.facts.business), t(about.facts.businessValue)],
              [t(about.facts.location), t(about.facts.locationValue)],
              [t(ui.contact.address), `${company.addressZh}\n${company.addressEn}`],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-4 py-4">
                <dt className="text-muted">{k}</dt>
                <dd className="col-span-2 whitespace-pre-line">{v}</dd>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-4 py-4">
              <dt className="text-muted">{t(about.facts.contact)}</dt>
              <dd className="col-span-2 space-y-2">
                <a href={`tel:${company.phoneE164}`} className="block link-underline w-fit">
                  {company.phoneDisplay}
                </a>
                <span className="flex items-center gap-3">
                  WeChat {company.wechatId} <CopyButton value={company.wechatId} label={ui.cta.copyWechat} />
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </section>
      <CtaBand locale={locale} />
    </>
  );
}
