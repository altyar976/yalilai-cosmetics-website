"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { Magnetic } from "@/components/motion/Magnetic";
import { ProductImage } from "@/components/ui/ProductImage";
import { categoryCover, productsInCategory } from "@/data/products";
import { categories, categoryIds } from "@/data/taxonomy";
import { useHref, useT } from "@/i18n/locale-context";
import { home } from "@/content/home";
import { ui } from "@/content/ui";
import { formatIndex } from "@/lib/utils";

/** Pinned horizontal editorial gallery on desktop; native swipe carousel on touch screens. */
export function CategoryGallery() {
  const t = useT();
  const href = useHref();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        gsap.utils.toArray<HTMLElement>("[data-panel-img]").forEach((img) => {
          gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: section.current, start: "top bottom", end: () => `+=${distance() + window.innerHeight}`, scrub: true } });
        });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-panel]", {
          clipPath: "inset(12% 8% 12% 8% round 1.5rem)",
          duration: 1.6,
          ease: "expo.out",
          stagger: 0.12,
          scrollTrigger: { trigger: section.current, start: "top 75%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} className="relative overflow-hidden bg-ivory py-20 lg:flex lg:h-[100svh] lg:items-center lg:py-0" aria-labelledby="cat-title">
      <div ref={track} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] lg:snap-none lg:overflow-visible lg:gap-8">
        <div className="flex w-[82vw] shrink-0 snap-start flex-col justify-center sm:w-[60vw] lg:w-[34vw] lg:pr-10">
          <p className="eyebrow">{t(home.categories.eyebrow)}</p>
          <SplitHeadline id="cat-title" text={t(home.categories.title)} className="display mt-5 text-[clamp(2.4rem,4.6vw,4.8rem)]" />
          <p className="lede mt-6 max-w-md">{t(home.categories.body)}</p>
          <Link href={href("/products")} className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-medium link-underline">
            {t(ui.nav.allProducts)} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        {categoryIds.map((id, i) => {
          const cover = categoryCover(id)!;
          return (
            <Link
              key={id}
              href={href(`/products/${id}`)}
              data-panel
              data-cursor={t(ui.nav.explore)}
              className="group relative block aspect-[4/5] w-[78vw] shrink-0 snap-start overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-ink/[0.06] sm:w-[52vw] lg:aspect-auto lg:h-[78svh] lg:w-[min(30vw,520px)]"
            >
              <div data-panel-img className="absolute inset-x-0 bottom-[30%] top-0">
                <ProductImage src={cover.image} alt={`${t(categories[id].name)} — ${cover.model}`} sizes="(min-width: 1024px) 30vw, 78vw" className="!object-contain transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.05]" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex h-[30%] items-end justify-between gap-4 border-t hairline bg-white p-6 lg:p-8">
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-display)] text-lg text-champagne-deep">{formatIndex(i + 1)}</p>
                  <h3 className="display mt-1 text-[clamp(1.7rem,2.4vw,2.6rem)] leading-[1.05]">{t(categories[id].name)}</h3>
                  <p className="mt-2 text-sm text-muted">
                    {productsInCategory(id).length} {t(ui.catalog.results)}
                  </p>
                </div>
                <Magnetic>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border hairline transition duration-500 group-hover:bg-ink group-hover:text-porcelain">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </Magnetic>
              </div>
            </Link>
          );
        })}
        <div className="w-4 shrink-0 lg:w-[6vw]" aria-hidden="true" />
      </div>
    </section>
  );
}
