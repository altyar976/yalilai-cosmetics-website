"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { useT } from "@/i18n/locale-context";
import { home } from "@/content/home";
import { formatIndex } from "@/lib/utils";

/** OEM/ODM journey with a scroll-drawn timeline. */
export function Journey() {
  const t = useT();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-line]",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-steps]", start: "top 70%", end: "bottom 60%", scrub: 0.6 } },
        );
        gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el) => {
          const dot = el.querySelector("[data-dot]");
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 72%", once: true } });
          tl.from(el.querySelector("[data-num]"), { yPercent: 100, autoAlpha: 0, duration: 1, ease: "expo.out" })
            .from(el.querySelectorAll("[data-text]"), { y: 24, autoAlpha: 0, duration: 1.1, stagger: 0.08, ease: "expo.out" }, 0.1)
            .fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.8, ease: "back.out(2)" }, 0);
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-ivory py-24 lg:py-36" aria-labelledby="journey-title">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow">{t(home.journey.eyebrow)}</p>
            <SplitHeadline id="journey-title" text={t(home.journey.title)} className="display mt-5 text-[clamp(2.4rem,4.4vw,4.4rem)]" />
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-muted">{t(home.journey.note)}</p>
          </div>
        </div>
        <ol data-steps className="relative lg:col-span-7 lg:col-start-6">
          <span aria-hidden="true" className="absolute bottom-6 left-[0.45rem] top-6 w-px bg-ink/10" />
          <span aria-hidden="true" data-line className="absolute bottom-6 left-[0.45rem] top-6 w-px origin-top bg-champagne" />
          {home.journey.steps.map((s, i) => (
            <li key={i} data-step className="relative grid grid-cols-[2.25rem_1fr] gap-x-6 pb-14 last:pb-0 sm:grid-cols-[2.25rem_6rem_1fr]">
              <span data-dot aria-hidden="true" className="relative z-10 mt-3 h-[0.95rem] w-[0.95rem] rounded-full border border-champagne bg-ivory" />
              <span className="hidden overflow-hidden sm:block">
                <span data-num className="block font-[family-name:var(--font-display)] text-5xl leading-none text-champagne-deep/80">
                  {formatIndex(i + 1)}
                </span>
              </span>
              <div>
                <h3 data-text className="display text-[1.9rem] sm:text-[2.2rem]">
                  <span className="mr-3 text-base text-champagne-deep sm:hidden">{formatIndex(i + 1)}</span>
                  {t(s.title)}
                </h3>
                <p data-text className="mt-3 max-w-xl leading-relaxed text-graphite/85">
                  {t(s.body)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
