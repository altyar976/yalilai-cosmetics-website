"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { factoryPhotoById } from "@/data/factory-photos";
import { useHref, useT } from "@/i18n/locale-context";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { certifications, certificationsPreview, isPublishable } from "@/data/certifications";
import { cn } from "@/lib/utils";

/**
 * Quality and process story. Certification marks appear only once an authorised logo file and the
 * certificate on file are recorded in `@/data/certifications`; until then the section shows none.
 */
export function QualityStory() {
  const t = useT();
  const href = useHref();
  const root = useRef<HTMLElement>(null);
  const photo = factoryPhotoById.get("changing-rooms")!;
  const hasVerified = certifications.some(isPublishable);
  const certs = certificationsPreview ? certifications : certifications.filter(isPublishable);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo("[data-q-img]", { clipPath: "inset(0% 0% 100% 0% round 1.5rem)" }, { clipPath: "inset(0% 0% 0% 0% round 1.5rem)", duration: 1.8, ease: "expo.inOut", scrollTrigger: { trigger: root.current, start: "top 70%", once: true } });
        gsap.fromTo("[data-q-img] img", { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
        gsap.from("[data-q-point]", { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: "[data-q-points]", start: "top 80%", once: true } });
        if (document.querySelector("[data-q-certs]")) {
          gsap.from("[data-q-cert]", { y: 24, autoAlpha: 0, duration: 1.4, stagger: 0.09, ease: "expo.out", clearProps: "transform,opacity,visibility", scrollTrigger: { trigger: "[data-q-certs]", start: "top 82%", once: true } });
        }
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className={cn("bg-ivory pt-24 lg:pt-36", certs.length ? "" : "pb-24 lg:pb-36")} aria-labelledby="quality-title">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div data-q-img className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] lg:sticky lg:top-28">
            <Image src={photo.src} alt={t(photo.alt)} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-[50%_40%]" placeholder={photo.blur ? "blur" : "empty"} blurDataURL={photo.blur} />
            <span className="absolute bottom-4 left-4 right-4 rounded-2xl bg-porcelain/85 p-4 text-xs leading-relaxed text-graphite backdrop-blur">
              <span className="block text-[0.62rem] uppercase tracking-[0.18em] text-champagne-deep">{t(ui.misc.realPhoto)}</span>
              {t(photo.caption)}
            </span>
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <p className="eyebrow">{t(home.quality.eyebrow)}</p>
          <SplitHeadline id="quality-title" text={t(home.quality.title)} className="display mt-5 text-[clamp(2.4rem,4.6vw,4.6rem)]" />
          <p className="lede mt-7">{t(home.quality.body)}</p>
          <ul data-q-points className="mt-12 divide-y divide-ink/10 border-y hairline">
            {home.quality.points.map((p, i) => (
              <li key={i} data-q-point className="grid gap-2 py-6 sm:grid-cols-[14rem_1fr] sm:gap-8">
                <h3 className="display text-2xl">{t(p.title)}</h3>
                <p className="text-graphite/85">{t(p.body)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 flex gap-3 rounded-2xl bg-linen p-5 text-sm text-graphite">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne-deep" strokeWidth={1.5} />
            {t(hasVerified ? home.quality.certsNote : home.quality.noLogos)}
          </p>
          <Link href={href("/quality")} className="mt-8 inline-flex items-center gap-2 text-sm font-medium link-underline">
            {t(ui.nav.quality)} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {certs.length > 0 && (
        <div data-q-certs className="mt-24 bg-white py-20 lg:mt-36 lg:py-28" aria-labelledby="certs-title">
          <div className="container-x">
            <p id="certs-title" className="eyebrow text-center">{t(home.quality.certsEyebrow)}</p>
            {certificationsPreview && !hasVerified && (
              <p className="mx-auto mt-4 w-fit rounded-full border border-dashed border-champagne px-4 py-1.5 text-center text-[0.68rem] uppercase tracking-[0.16em] text-champagne-deep">
                {t(home.quality.certsPreview)}
              </p>
            )}
            <ul className="mx-auto mt-14 flex max-w-6xl flex-wrap justify-center gap-y-14 lg:mt-16 lg:flex-nowrap">
              {certs.map((c) => (
                <li key={c.id} data-q-cert className="flex basis-1/2 flex-col items-center px-3 text-center sm:basis-1/3 lg:basis-1/5 lg:px-5">
                  <div className="flex h-28 w-full items-center justify-center sm:h-32 lg:h-36">
                    {c.logo ? (
                      <Image
                        src={c.logo.src}
                        alt={c.mark}
                        width={c.logo.width}
                        height={c.logo.height}
                        sizes="(min-width: 1024px) 200px, 160px"
                        quality={88}
                        className="h-full w-auto max-w-full object-contain"
                      />
                    ) : (
                      <span className="flex aspect-square h-full items-center justify-center rounded-full border border-dashed border-stone p-4 text-[0.62rem] uppercase leading-snug tracking-[0.14em] text-muted">
                        {c.mark}
                        <br />
                        {t(home.quality.certsPending)}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-6 text-[0.8rem] font-medium uppercase tracking-[0.16em] text-ink">{t(c.title)}</h3>
                  <p className="mt-1.5 max-w-[14rem] text-xs leading-relaxed text-muted">{t(c.caption)}</p>
                  {c.native && (
                    <p lang={c.native.lang} dir={c.native.dir} className="mt-0.5 text-xs text-muted">
                      {c.native.text}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
